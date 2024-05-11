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
    if (
        applicableTo.children.length === 1 &&
        applicableTo.children[0].element.type === "ExpressionStatement"
    ) {
        let matcher = new Matcher(
            internals,
            applicableTo.children[0].children[0].element
        );
        matcher.singleExprMatcher(code, applicableTo.children[0].children[0]);
        return matcher.matches;
    } else {
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
        let curMatches = this.checkCodeNode(code.element, aplTo.element);
        curMatches =
            curMatches && code.children.length >= aplTo.children.length;
        // Current does not match and we have searched all the children, so just return early
        // This ensures we only store the child search when we don't only have a partial match
        let temp = [];
        // If any matches bubble up from child nodes, we have to store it
        for (let code_child of code.children) {
            let maybeChildMatch = this.singleExprMatcher(code_child, aplTo);
            if (maybeChildMatch) {
                temp.push(maybeChildMatch);
            }
        }

        // Filter the output for full matches :)
        this.matches.push(
            ...temp.filter((x) => x.element.aplToNode === this.aplToFull)
        );
        if (!curMatches) {
            return;
        }
        // At this point current does match
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
                // Failed to get a full match, so break here
                return;
            }
            childSearch.parent = pairedCurrent;
            pairedCurrent.children.push(childSearch);
        }

        // If we are here, a full match has been found
        return pairedCurrent;
    }

    // This is broken
    multiStatementMatcher(code: TreeNode<t.Node>, aplTo: TreeNode<t.Node>) {
        console.log("Currently unsupported");
    }

    match(code: TreeNode<t.Node>, aplTo: TreeNode<t.Node>) {}
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

    private buildPairTree(
        code: TreeNode<t.Node>,
        aplTo: TreeNode<t.Node>
    ): TreeNode<PairedNodes> {
        let temp: TreeNode<PairedNodes> = new TreeNode(null, {
            codeNode: code.element,
            aplToNode: aplTo.element,
        });
        if (code.children.length >= aplTo.children.length) {
            for (let i = 0; i < aplTo.children.length; i++) {
                let child = this.buildPairTree(
                    code.children[i],
                    aplTo.children[i]
                );
                temp.children.push(child);
            }
        } else {
            console.log("ERROR");
        }

        return temp;
    }
}
