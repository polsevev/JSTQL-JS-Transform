import * as t from "@babel/types";

import * as babelparser from "@babel/parser";

import {
    TreeNode,
    makeTree,
    showTree,
    showTreePaired,
} from "../data_structures/tree";
import { Match, MatchedTreeNode, PairedNodes } from "../matcher/matcher";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { TransformRecipe } from "./transform";

export function transformer(
    matches: Match[],
    transformTo: TreeNode<t.Node>,
    codeAST: t.Node,
    traToAST: t.File
): t.Node {
    for (let match of matches.reverse()) {
        try {
            let traToWithWildcards = structuredClone(traToAST);
            for (let match_stmt of match.statements) {
                transformMatch(match_stmt, transformTo, traToWithWildcards);
            }
            traverse(codeAST, {
                enter(path) {
                    if (
                        !(
                            path.node.type === "Program" ||
                            path.node.type === "File"
                        )
                    ) {
                        if (
                            path.node ===
                            match.statements[0].element.codeNode[0]
                        ) {
                            path.replaceWithMultiple(
                                traToWithWildcards.program.body
                            );
                            let siblings = path.getAllNextSiblings();

                            // For multi line applicable to
                            for (
                                let i = 0;
                                i < match.statements.length - 1;
                                i++
                            ) {
                                siblings[i].remove();
                            }

                            // For when we have matched with *

                            for (let matchStmt of match.statements) {
                                for (let [
                                    i,
                                    stmtMatchedWithStar,
                                ] of matchStmt.element.codeNode.entries()) {
                                    let siblingnodes = siblings.map(
                                        (a) => a.node
                                    );
                                    if (
                                        siblingnodes.includes(
                                            stmtMatchedWithStar
                                        )
                                    ) {
                                        let index =
                                            siblingnodes.indexOf(
                                                stmtMatchedWithStar
                                            );
                                        siblings[index].remove();
                                    }
                                }
                            }
                        }
                    }
                },
            });
        } catch (e) {
            console.log(e);
        }
    }

    return codeAST;
}

export function transformMatch(
    match: TreeNode<PairedNodes>,
    trnTo: TreeNode<t.Node>,
    output: t.Node
) {
    let isMatchingIdentifier = matchNode(
        match.element.aplToNode,
        trnTo.element
    );
    if (isMatchingIdentifier) {
        traverse(output, {
            Identifier: (path) => {
                if (path.node.name === (<t.Identifier>trnTo.element).name) {
                    path.replaceWithMultiple(match.element.codeNode);
                }
            },
            ExpressionStatement: (path) => {
                if (trnTo.element.type === "ExpressionStatement") {
                    if (
                        path.node.expression.type === "Identifier" &&
                        trnTo.element.expression.type === "Identifier"
                    ) {
                        let ident = path.node.expression;
                        if (ident.name === trnTo.element.expression.name) {
                            path.replaceWithMultiple(match.element.codeNode);
                        }
                    }
                }
            },
        });
    } else {
        for (let match_child of match.children) {
            transformMatch(match_child, trnTo, output);
        }
        for (let trnTo_child of trnTo.children) {
            transformMatch(match, trnTo_child, output);
        }
    }
}

function matchNode(aplTo: t.Node, trnTo: t.Node): boolean {
    //console.log(trnTo);

    if (
        trnTo.type === "ExpressionStatement" &&
        aplTo.type == "ExpressionStatement"
    ) {
        if (
            trnTo.expression.type === "Identifier" &&
            aplTo.expression.type === "Identifier"
        ) {
            return aplTo.expression.name === trnTo.expression.name;
        }
    }

    if (trnTo.type == "Identifier" && aplTo.type == "Identifier") {
        return aplTo.name === trnTo.name;
    }
    return false;
}

function washName(name: string): string {
    return name;
    if (name.startsWith("_-_")) {
        return name.slice(3);
    }
    return name;
}
