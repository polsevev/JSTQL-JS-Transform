import * as t from "@babel/types";

import * as babelparser from "@babel/parser";
import { TreeNode, makeTree, showTree } from "../data_structures/tree";
import { InternalDSLVariable } from "../parser/parse";

const keys_to_ignore = ["loc", "start", "end", "type"];

export interface MatchedTreeNode {
    aplToNode: TreeNode<t.Node>;
    codeNode: TreeNode<t.Node>;
}

export interface PairedNodes {
    aplToNode: t.Node;
    codeNode: t.Node;
}

export function runMatch(
    code: TreeNode<t.Node>,
    applicableTo: TreeNode<t.Node>,
    internals: InternalDSLVariable
): TreeNode<PairedNodes>[] {
    // Special case for a single expression, we have to remove "ExpressionStatement" node.
    if (applicableTo.children.length === 1) {
        if (applicableTo.children[0].element.type === "ExpressionStatement") {
            let matcher = new Matcher(
                internals,
                applicableTo.children[0].children[0].element
            );
            matcher.singleExprMatcher(
                code,
                applicableTo.children[0].children[0]
            );
            return matcher.matches;
        } else {
            let matcher = new Matcher(
                internals,
                applicableTo.children[0].element
            );
            matcher.singleExprMatcher(code, applicableTo.children[0]);
            return matcher.matches;
        }
    } else {
        showTree(code);
        showTree(applicableTo);

        let matcher = new Matcher(internals, applicableTo.element);
        matcher.multiStatementMatcher(code, applicableTo);
        return matcher.matches;
    }
}

export class Matcher {
    public matches: TreeNode<PairedNodes>[];
    private internals: InternalDSLVariable;
    private aplToFull: t.Node;
    constructor(internals: InternalDSLVariable, aplToFull: t.Node) {
        this.matches = [];
        this.internals = internals;
        this.aplToFull = aplToFull;
    }

    singleExprMatcher(
        code: TreeNode<t.Node>,
        aplTo: TreeNode<t.Node>
    ): TreeNode<PairedNodes> | undefined {
        // If we are at start of ApplicableTo, start a new search on each of the child nodes
        if (aplTo.element === this.aplToFull) {
            // Perform a new search on all child nodes before trying to verify current node
            let temp = [];
            // If any matches bubble up from child nodes, we have to store it
            for (let code_child of code.children) {
                let maybeChildMatch = this.singleExprMatcher(code_child, aplTo);
                if (maybeChildMatch) {
                    temp.push(maybeChildMatch);
                }
            }
            // Store all full matches
            this.matches.push(...temp);
        }
        // Check if the current matches

        let curMatches = this.checkCodeNode(code.element, aplTo.element);
        curMatches =
            curMatches && code.children.length >= aplTo.children.length;
        if (!curMatches) {
            return;
        }
        // At this point current does match
        // Perform a search on each of the children of both AplTo and Code.
        let pairedCurrent: TreeNode<PairedNodes> = new TreeNode(null, {
            codeNode: code.element,
            aplToNode: aplTo.element,
        });
        for (let i = 0; i < aplTo.children.length; i++) {
            let childSearch = this.singleExprMatcher(
                code.children[i],
                aplTo.children[i]
            );
            if (childSearch === undefined) {
                // Failed to get a full match, so early return here
                return;
            }
            childSearch.parent = pairedCurrent;
            pairedCurrent.children.push(childSearch);
        }

        // If we are here, a full match has been found
        return pairedCurrent;
    }

    multiStatementMatcher(code: TreeNode<t.Node>, aplTo: TreeNode<t.Node>) {
        if (
            code.element.type === "Program" ||
            code.element.type === "BlockStatement"
        ) {
            this.matchMultiHead(code.children, aplTo.children);
        }

        for (let code_child of code.children) {
            this.multiStatementMatcher(code_child, aplTo);
        }
    }

    matchMultiHead(code: TreeNode<t.Node>[], aplTo: TreeNode<t.Node>[]) {
        // Sliding window the size of aplTo
        for (let y = 0; y <= code.length - aplTo.length; y++) {
            let fullMatch = true;
            let collection: TreeNode<PairedNodes>[] = [];
            for (let i = 0; i < aplTo.length; i++) {
                let res = this.exactExprMatcher(code[i + y], aplTo[i]);
                if (!res) {
                    fullMatch = false;
                    break;
                }
                collection.push(res);
            }
            if (fullMatch) {
                this.matches.push(...collection);
            }
        }
    }
    exactExprMatcher(
        code: TreeNode<t.Node>,
        aplTo: TreeNode<t.Node>
    ): TreeNode<PairedNodes> | undefined {
        let curMatches =
            this.checkCodeNode(code.element, aplTo.element) &&
            code.children.length >= aplTo.children.length;

        if (!curMatches) {
            return undefined;
        }

        let paired: TreeNode<PairedNodes> = new TreeNode(null, {
            aplToNode: aplTo.element,
            codeNode: code.element,
        });

        for (let i = 0; i < aplTo.children.length; i++) {
            let childRes = this.exactExprMatcher(
                code.children[i],
                aplTo.children[i]
            );
            if (!childRes) {
                // If child is not match the entire thing is not a match;
                return undefined;
            }
            // This is a match, so we store it
            childRes.parent = paired;
            paired.children.push(childRes);
        }

        return paired;
    }

    private checkCodeNode(code_node: t.Node, aplTo: t.Node): boolean {
        // First verify the internal DSL variables

        if (aplTo.type === "Identifier") {
            if (aplTo.name in this.internals) {
                if (this.internals[aplTo.name].includes(code_node.type)) {
                    return true;
                }

                if (this.internals[aplTo.name].includes("Expression")) {
                    return t.isExpression(code_node);
                }
            }
        }

        if (code_node.type != aplTo.type) {
            return false;
        }

        //If not an internal DSL variable, gotta verify that the identifier is the same
        if (code_node.type === "Identifier" && aplTo.type === "Identifier") {
            if (code_node.name != aplTo.name) {
                return false;
            }
        }
        for (let key of Object.keys(aplTo)) {
            if (key in keys_to_ignore) {
                continue;
            }

            if (!Object.keys(code_node).includes(key)) {
                return false;
            }
        }

        return true;
    }
}
