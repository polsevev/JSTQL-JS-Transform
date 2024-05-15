import * as t from "@babel/types";

import * as babelparser from "@babel/parser";
import { TreeNode, makeTree, showTree } from "../data_structures/tree";
import { Wildcard } from "../parser/parse";
import generate from "@babel/generator";
import { WildcardEvalVisitor } from "./wildcardEvaluator";

const keys_to_ignore = ["loc", "start", "end", "type"];
export interface MatchedTreeNode {
    aplToNode: TreeNode<t.Node>;
    codeNode: TreeNode<t.Node>;
}

export interface PairedNodes {
    aplToNode: t.Node;
    codeNode: t.Node;
}

export interface Match {
    statements: TreeNode<PairedNodes>[];
}

enum MatchCurrentResult {
    MatchedWithWildcard,
    Matched,
    NoMatch,
}

export function runMatch(
    code: TreeNode<t.Node>,
    applicableTo: TreeNode<t.Node>,
    internals: Wildcard[]
): Match[] {
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
        let matcher = new Matcher(internals, applicableTo.element);
        matcher.multiStatementMatcher(code, applicableTo);

        return matcher.matches;
    }
}

export class Matcher {
    public matches: Match[];
    private internals: Wildcard[];
    private aplToFull: t.Node;
    constructor(internals: Wildcard[], aplToFull: t.Node) {
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
            this.matches.push(
                ...temp.map((x) => {
                    return {
                        statements: [x],
                    };
                })
            );
        }
        // Check if the current matches

        let curMatches = this.checkCodeNode(code.element, aplTo.element);
        let pairedCurrent: TreeNode<PairedNodes> = new TreeNode(null, {
            codeNode: code.element,
            aplToNode: aplTo.element,
        });
        if (curMatches === MatchCurrentResult.NoMatch) {
            return;
        } else if (curMatches === MatchCurrentResult.MatchedWithWildcard) {
            return pairedCurrent;
        } else if (code.children.length !== aplTo.children.length) {
            return;
        }
        // At this point current does match
        // Perform a search on each of the children of both AplTo and Code.

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

    private checkCodeNode(
        codeNode: t.Node,
        aplToNode: t.Node
    ): MatchCurrentResult {
        // First verify the internal DSL variables

        if (aplToNode.type === "Identifier") {
            for (let wildcard of this.internals) {
                if (WildcardEvalVisitor.visit(wildcard.expr, codeNode)) {
                    return MatchCurrentResult.MatchedWithWildcard;
                }
            }
        }

        if (codeNode.type != aplToNode.type) {
            return MatchCurrentResult.NoMatch;
        }

        //If not an internal DSL variable, gotta verify that the identifier is the same
        if (codeNode.type === "Identifier" && aplToNode.type === "Identifier") {
            if (codeNode.name != aplToNode.name) {
                return MatchCurrentResult.NoMatch;
            }
        }
        for (let key of Object.keys(aplToNode)) {
            if (key in keys_to_ignore) {
                continue;
            }

            if (!Object.keys(codeNode).includes(key)) {
                return MatchCurrentResult.NoMatch;
            }
        }

        return MatchCurrentResult.Matched;
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
            let statements: TreeNode<PairedNodes>[] = [];
            for (let i = 0; i < aplTo.length; i++) {
                let res = this.exactExprMatcher(code[i + y], aplTo[i]);
                if (!res) {
                    fullMatch = false;
                    break;
                }
                statements.push(res);
            }
            if (fullMatch) {
                console.log(statements.length);
                this.matches.push({ statements });
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
}
