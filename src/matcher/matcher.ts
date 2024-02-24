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
    internals: Map<string, InternalDSLVariable>
): TreeNode<PairedNodes>[] {
    let matches: TreeNode<t.Node>[] = [];

    function checkDSLInternals(code_node: t.Node, aplTo: t.Node): boolean {
        if (aplTo.type == "Identifier" && internals.has(aplTo.name)) {
            let dsl_types = internals.get(aplTo.name)?.type ?? [];

            for (const dsl_type of dsl_types) {
                if (dsl_type == "Expression") {
                    if (
                        code_node.type.includes("Expression") ||
                        code_node.type == "StringLiteral"
                    ) {
                        return true;
                    }
                } else if (dsl_type == "") {
                    if (
                        code_node.type == "Identifier" &&
                        aplTo.type == "Identifier"
                    ) {
                        return true;
                    }
                } else if (dsl_type == "Identifier") {
                    if (code_node.type == "Identifier") {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function match(
        code: TreeNode<t.Node>,
        applicableTo: TreeNode<t.Node>
    ): boolean {
        if (code.element.type == "Program") {
            code.children.forEach((code_child) => {
                match(code_child, applicableTo);
            });
        }

        // This is a bit wierd, as we currently do not support having ApplicableTo be multiple statements
        if (applicableTo.element.type == "Program") {
            match(code, applicableTo.children[0]);
        }

        let node_matches = checkCodeNode(code.element, applicableTo.element);

        //If element matches DSL internals, we return right away and ignore the contents
        if (checkDSLInternals(code.element, applicableTo.element)) {
            return true;
        }

        if (node_matches) {
            if (applicableTo.children.length != code.children.length) {
                return false;
            }
            for (let i = 0; i < applicableTo.children.length; i++) {
                //Verify we can actually do a match
                if (!match(code.children[i], applicableTo.children[i])) {
                    return false;
                }
            }
            return true;
        } else {
            for (let code_child of code.children) {
                //Avoid matching on single identifier
                if (code_child.element.type == "Identifier") {
                    continue;
                }
                if (match(code_child, applicableTo)) {
                    matches.push(code_child);
                }
            }
            return false;
        }
    }
    match(code, applicableTo);
    console.log(matches.length);

    return matches
        .map((match) => pairMatch(match, applicableTo))
        .filter((match) => match != null);
}

function pairMatch(
    match: TreeNode<t.Node>,
    aplTo: TreeNode<t.Node>
): TreeNode<PairedNodes> | null {
    if (aplTo.element.type == "Program") {
        return pairMatch(match, aplTo.children[0]);
    }
    try {
        let node: TreeNode<PairedNodes> = new TreeNode(null, {
            codeNode: match.element,
            aplToNode: aplTo.element,
        });

        for (let i = 0; i < aplTo.children.length; i++) {
            let child = pairMatch(match.children[i], aplTo.children[i]);
            child.parent = node;
            node.children.push(child);
        }

        return node;
    } catch (exception) {
        return null;
    }
}

function checkCodeNode(code_node: t.Node, aplTo: t.Node): boolean {
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
