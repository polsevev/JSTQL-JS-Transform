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
    codeNode: t.Node[];
}

export interface Match {
    statements: TreeNode<PairedNodes>[];
}

enum MatchResult {
    MatchedWithWildcard,
    MatchedWithStarredWildcard,
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
    ): [TreeNode<PairedNodes> | undefined, MatchResult] {
        // If we are at start of ApplicableTo, start a new search on each of the child nodes
        if (aplTo.element === this.aplToFull) {
            // Perform a new search on all child nodes before trying to verify current node
            let temp = [];
            // If any matches bubble up from child nodes, we have to store it
            for (let code_child of code.children) {
                let [maybeChildMatch, matchResult] = this.singleExprMatcher(
                    code_child,
                    aplTo
                );
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
            codeNode: [code.element],
            aplToNode: aplTo.element,
        });
        if (curMatches === MatchResult.NoMatch) {
            return [undefined, MatchResult.NoMatch];
        } else if (
            curMatches === MatchResult.MatchedWithWildcard ||
            curMatches === MatchResult.MatchedWithStarredWildcard
        ) {
            return [pairedCurrent, curMatches];
        }
        // At this point current does match
        // Perform a search on each of the children of both AplTo and Code.

        let i = 0;
        let aplToi = 0;
        while (aplToi < aplTo.children.length) {
            if (i >= code.children.length) {
                return [undefined, MatchResult.NoMatch];
            }
            let [pairedChild, childResult] = this.singleExprMatcher(
                code.children[i],
                aplTo.children[aplToi]
            );

            if (pairedChild === undefined) {
                // Failed to get a full match, so early return here
                return [undefined, MatchResult.NoMatch];
            }

            pairedChild.parent = pairedCurrent;
            pairedCurrent.children.push(pairedChild);
            if (childResult === MatchResult.MatchedWithStarredWildcard) {
                i += 1;
                while (i < code.children.length) {
                    let [maybeChild, starChildResult] = this.singleExprMatcher(
                        code.children[i],
                        aplTo.children[aplToi]
                    );
                    if (
                        starChildResult !=
                            MatchResult.MatchedWithStarredWildcard ||
                        maybeChild === undefined
                    ) {
                        i -= 1;
                        break;
                    }
                    pairedChild.element.codeNode.push(
                        ...maybeChild.element.codeNode
                    );
                    i += 1;
                }
            }

            i += 1;
            aplToi += 1;
        }
        if (i < code.children.length) {
            return [undefined, MatchResult.NoMatch];
        }
        // If we are here, a full match has been found
        return [pairedCurrent, curMatches];
    }

    private checkCodeNode(codeNode: t.Node, aplToNode: t.Node): MatchResult {
        // First verify the internal DSL variables
        if (
            aplToNode.type === "ExpressionStatement" &&
            aplToNode.expression.type === "Identifier"
        ) {
            aplToNode = aplToNode.expression;
        }
        if (aplToNode.type === "Identifier") {
            for (let wildcard of this.internals) {
                if (aplToNode.name === wildcard.identifier.name) {
                    let visitorResult = WildcardEvalVisitor.visit(
                        wildcard.expr,
                        codeNode
                    );
                    if (visitorResult && wildcard.star) {
                        return MatchResult.MatchedWithStarredWildcard;
                    } else if (visitorResult) {
                        return MatchResult.MatchedWithWildcard;
                    }
                }
            }
        }

        if (codeNode.type != aplToNode.type) {
            return MatchResult.NoMatch;
        }

        //If not an internal DSL variable, gotta verify that the identifier is the same
        if (codeNode.type === "Identifier" && aplToNode.type === "Identifier") {
            if (codeNode.name != aplToNode.name) {
                return MatchResult.NoMatch;
            }
        }

        for (let [key, val] of Object.entries(aplToNode)) {
            if (keys_to_ignore.includes(key)) {
                continue;
            }
            if (typeof val !== "object") {
                if (codeNode[key] !== val) {
                    return MatchResult.NoMatch;
                }
            }
        }

        return MatchResult.Matched;
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
            let aplToi = 0;
            let codei = 0;
            while (aplToi < aplTo.length && codei + y < code.length) {
                let [paired, matchResult] = this.exactExprMatcher(
                    code[codei + y],
                    aplTo[aplToi]
                );
                if (!paired) {
                    fullMatch = false;
                    break;
                }

                if (matchResult === MatchResult.MatchedWithStarredWildcard) {
                    codei += 1;
                    while (codei + y < code.length) {
                        let [next, nextMatchRes] = this.exactExprMatcher(
                            code[codei + y],
                            aplTo[aplToi]
                        );
                        if (
                            !next ||
                            nextMatchRes !==
                                MatchResult.MatchedWithStarredWildcard
                        ) {
                            codei -= 1;
                            break;
                        }
                        paired.element.codeNode.push(...next.element.codeNode);
                        codei += 1;
                    }
                }

                statements.push(paired);
                aplToi += 1;
                codei += 1;
            }
            if (aplToi !== aplTo.length) {
                fullMatch = false;
            }
            if (fullMatch) {
                this.matches.push({ statements });
            }
        }
    }
    exactExprMatcher(
        code: TreeNode<t.Node>,
        aplTo: TreeNode<t.Node>
    ): [TreeNode<PairedNodes> | undefined, MatchResult] {
        let curMatches = this.checkCodeNode(code.element, aplTo.element);

        if (curMatches === MatchResult.NoMatch) {
            return [undefined, MatchResult.NoMatch];
        }

        let paired: TreeNode<PairedNodes> = new TreeNode(null, {
            aplToNode: aplTo.element,
            codeNode: [code.element],
        });
        if (
            curMatches === MatchResult.MatchedWithStarredWildcard ||
            curMatches === MatchResult.MatchedWithWildcard
        ) {
            return [paired, curMatches];
        }

        let i = 0;
        let aplToi = 0;
        while (i < code.children.length && aplToi < aplTo.children.length) {
            let [pairedChild, childResult] = this.exactExprMatcher(
                code.children[i],
                aplTo.children[aplToi]
            );
            if (!pairedChild) {
                // If child is not match the entire thing is not a match;
                return [undefined, MatchResult.NoMatch];
            }

            // This is a match, so we store it
            pairedChild.parent = paired;
            paired.children.push(pairedChild);

            if (childResult === MatchResult.MatchedWithStarredWildcard) {
                i += 1;
                while (i < code.children.length) {
                    let [maybeChild, starChildResult] = this.singleExprMatcher(
                        code.children[i],
                        aplTo.children[aplToi]
                    );
                    if (
                        starChildResult !=
                            MatchResult.MatchedWithStarredWildcard ||
                        maybeChild === undefined
                    ) {
                        i -= 1;
                        break;
                    }

                    pairedChild.element.codeNode.push(
                        ...maybeChild.element.codeNode
                    );
                    i += 1;
                }
            }

            i += 1;
            aplToi += 1;
        }
        // Verify it is a full match
        if (aplToi < aplTo.children.length) {
            return [undefined, MatchResult.NoMatch];
        }
        if (i < code.children.length) {
            return [undefined, MatchResult.NoMatch];
        }
        return [paired, curMatches];
    }
}
