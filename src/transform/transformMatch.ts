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
import { Wildcard } from "../parser/parse";

export function transformer(
    matches: Match[],
    transformTo: TreeNode<t.Node>,
    codeAST: t.Node,
    traToAST: t.File,
    wildcardIdentifiers: string[]
): t.Node {
    let transformedTransformTo: [Match, t.File][] = [];
    for (let match of matches.reverse()) {
        try {
            let traToWithWildcards = structuredClone(traToAST);
            for (let match_stmt of match.statements) {
                let aplToWildcards: Map<string, t.Node[]> = new Map();
                FindWildcardsAplTo(
                    match_stmt,
                    wildcardIdentifiers,
                    aplToWildcards
                );
                transformMatch(match_stmt, transformTo, traToWithWildcards);
            }

            transformedTransformTo.push([match, traToWithWildcards]);
        } catch (e) {
            console.log(e);
        }
        //console.log("Finished replacement");
    }
    for (let [match, traToWithWildcards] of transformedTransformTo) {
        traverse(codeAST, {
            enter(path) {
                if (
                    !(path.node.type === "Program" || path.node.type === "File")
                ) {
                    if (path.node === match.statements[0].element.codeNode[0]) {
                        path.replaceWithMultiple(
                            traToWithWildcards.program.body
                        );
                        let siblings = path.getAllNextSiblings();

                        // For multi line applicable to
                        for (let i = 0; i < match.statements.length - 1; i++) {
                            siblings[i].remove();
                        }

                        // For when we have matched with +

                        for (let matchStmt of match.statements) {
                            for (let [
                                i,
                                stmtMatchedWithStar,
                            ] of matchStmt.element.codeNode.entries()) {
                                let siblingnodes = siblings.map((a) => a.node);
                                if (
                                    siblingnodes.includes(stmtMatchedWithStar)
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
    }
    return codeAST;
}

function FindWildcardsAplTo(
    match: TreeNode<PairedNodes>,
    wildcardIdentifiers: string[],
    out: Map<string, t.Node[]>
) {
    let ident = isWildcardIdent(wildcardIdentifiers, match.element.aplToNode);
    if (!ident) {
        return;
    }

    out.set(ident, match.element.codeNode);

    for (let child of match.children) {
        FindWildcardsAplTo(child, wildcardIdentifiers, out);
    }
}

function isWildcardIdent(
    wildcards: string[],
    aplToNode: t.Node
): string | undefined {
    if (aplToNode.type === "Identifier") {
        for (let ident of wildcards) {
            if (aplToNode.name === ident) {
                return ident;
            }
        }
    } else if (
        aplToNode.type === "ExpressionStatement" &&
        aplToNode.expression.type === "Identifier"
    ) {
        for (let ident of wildcards) {
            if (aplToNode.expression.name === ident) {
                return ident;
            }
        }
    }
    return undefined;
}

export function transformTransformTo(
    wildcardsMatchedWith: Map<string, t.Node>,
    output: t.Node
) {
    traverse(output, {
        Identifier: (path) => {
            if (wildcardsMatchedWith.has(path.node.name)) {
                let newNode = wildcardsMatchedWith.get(path.node.name);
                if (newNode) {
                    path.replaceWithMultiple(newNode);
                }
            }
        },
        ExpressionStatement: (path) => {
            if (
                path.node.expression.type === "Identifier" &&
                wildcardsMatchedWith.has(path.node.expression.name)
            ) {
                let newNode = wildcardsMatchedWith.get(
                    path.node.expression.name
                );
                if (newNode) {
                    path.replaceWithMultiple(newNode);
                }
            }
        },
    });
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
