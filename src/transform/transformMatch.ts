import * as t from "@babel/types";

import * as babelparser from "@babel/parser";

import {
    TreeNode,
    makeTree,
    showTree,
    showTreePaired,
} from "../data_structures/tree";
import { InternalDSLVariable } from "../parser/parse";
import { MatchedTreeNode, PairedNodes } from "../matcher/matcher";
import traverse from "@babel/traverse";

export function transformer(
    match: TreeNode<PairedNodes>,
    trnTo: TreeNode<t.Node>,
    output: t.Node,
    inputCode: t.Node
) {
    transformMatch(match, trnTo, output);

    if (output.type == "Program") {
        output = output.body[0];
    }

    traverse(inputCode, {
        enter(path) {
            if (path.node === match.element.codeNode) {
                path.replaceWith(output);
            }
        },
    });
}

export function transformMatch(
    match: TreeNode<PairedNodes>,
    trnTo: TreeNode<t.Node>,
    output: t.Node
) {
    if (trnTo.element.type == "Program") {
        return transformMatch(match, trnTo.children[0], output);
    }

    let isMatch = matchNode(match.element.aplToNode, trnTo.element);
    if (isMatch) {
        if (trnTo.element.type == "Identifier") {
            traverse(output, {
                enter(path) {
                    if (path.isIdentifier({ name: trnTo.element.name })) {
                        console.log(match.element.codeNode);
                        if (match.element.codeNode) {
                            path.replaceWith(match.element.codeNode);
                        }
                    }
                },
            });
        }
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

    if (trnTo.type == "Identifier" && aplTo.type == "Identifier") {
        let aplToName = washName(aplTo.name);
        let trnToName = trnTo.name;
        if (aplToName == trnToName) {
            return true;
        }
    } else if (trnTo.type == "Identifier" && aplTo.type == "Identifier") {
        let aplToName = washName(aplTo.name);
        let trnToName = trnTo.name;

        if (aplToName == trnToName) {
            return true;
        }
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
