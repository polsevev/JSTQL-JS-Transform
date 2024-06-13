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
    traToAST: t.File
): t.Node {
    let transformedTransformTo: Map<t.Node, [t.File, Match]> = new Map();

    for (let match of matches.reverse()) {
        try {
            let traToWithWildcards = structuredClone(traToAST);
            let wildcardMatches = extractWildcardPairs(match);

            transformedTransformTo.set(
                match.statements[0].element.codeNode[0],
                [
                    transformMatchFaster(wildcardMatches, traToWithWildcards),
                    match,
                ]
            );
        } catch (e) {
            console.log(e);
        }
    }

    traverse(codeAST, {
        enter(path) {
            if (!(path.node.type === "Program" || path.node.type === "File")) {
                if (transformedTransformTo.has(path.node)) {
                    let [traToWithWildcards, match] =
                        transformedTransformTo.get(path.node) as [
                            t.File,
                            Match
                        ];
                    path.replaceWithMultiple(traToWithWildcards.program.body);
                    let siblings = path.getAllNextSiblings();

                    // For multi line applicable to
                    for (let i = 0; i < match.statements.length - 1; i++) {
                        //siblings[i].remove();
                    }

                    // For when we have matched with +
                    for (let matchStmt of match.statements) {
                        for (let stmtMatchedWithPlus of matchStmt.element
                            .codeNode) {
                            let siblingnodes = siblings.map((a) => a.node);
                            if (siblingnodes.includes(stmtMatchedWithPlus)) {
                                let index =
                                    siblingnodes.indexOf(stmtMatchedWithPlus);
                                siblings[index].remove();
                            }
                        }
                    }
                }
            }
        },
    });
    return codeAST;
}

function transformMatchFaster(
    wildcardMatches: Map<string, t.Node[]>,
    transformTo: t.File
): t.File {
    traverse(transformTo, {
        Identifier: (path) => {
            if (wildcardMatches.has(path.node.name)) {
                let toReplaceWith = wildcardMatches.get(path.node.name);
                if (toReplaceWith) {
                    path.replaceWithMultiple(toReplaceWith);
                }
            }
        },
        ExpressionStatement: (path) => {
            if (path.node.expression.type === "Identifier") {
                let name = path.node.expression.name;
                if (wildcardMatches.has(name)) {
                    let toReplaceWith = wildcardMatches.get(name);
                    if (toReplaceWith) {
                        path.replaceWithMultiple(toReplaceWith);
                    }
                }
            }
        },
    });

    return transformTo;
}

function extractWildcardPairs(match: Match): Map<string, t.Node[]> {
    let map: Map<string, t.Node[]> = new Map();

    function recursiveSearch(node: TreeNode<PairedNodes>) {
        let name: null | string = null;
        if (node.element.aplToNode.type === "Identifier") {
            name = node.element.aplToNode.name;
        } else if (
            node.element.aplToNode.type === "ExpressionStatement" &&
            node.element.aplToNode.expression.type === "Identifier"
        ) {
            name = node.element.aplToNode.expression.name;
        }
        
        if (name && name.startsWith("_$$_")) {
            if (map.has(name)) {
                console.log(name);
                console.log(map.get(name));
                throw new Error("Wildcard encountered twice!");
            }

            map.set(name, node.element.codeNode);
        }

        for (let child of node.children) {
            recursiveSearch(child);
        }
    }
    for (let stmt of match.statements) {
        recursiveSearch(stmt);
    }
    return map;
}

function washName(name: string): string {
    return name;
    if (name.startsWith("_-_")) {
        return name.slice(3);
    }
    return name;
}
