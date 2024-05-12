import * as babelparser from "@babel/parser";

import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { PairedNodes } from "../matcher/matcher";

export class TreeNode<T> {
    public parent: TreeNode<T> | null;
    public element: T;
    public children: TreeNode<T>[] = [];

    constructor(parent: TreeNode<T> | null, element: T) {
        this.parent = parent;
        this.element = element;
        if (this.parent) this.parent.children.push(this);
    }
}

export const makeTree = (
    ast: babelparser.ParseResult<t.File>
): TreeNode<t.Node> | undefined => {
    let last: TreeNode<t.Node> | null = null;

    let first: TreeNode<t.Node> | null = null;
    traverse(ast, {
        enter(path: any) {
            let node: TreeNode<t.Node> = new TreeNode<t.Node>(
                last,
                path.node as t.Node
            );

            if (last == null) {
                first = node;
            }
            last = node;
        },
        exit(path: any) {
            if (last && last?.element?.type != "Program") {
                last = last.parent;
            }
        },
    });
    if (first != null) {
        return first;
    }
};
export const showTree = (tree: TreeNode<t.Node>, idents: number = 0) => {
    console.log("   ".repeat(idents) + tree.element?.type);
    tree.children.forEach((child) => {
        showTree(child, idents + 1);
    });
};
export const showTreePaired = (
    tree: TreeNode<PairedNodes>,
    idents: number = 0
) => {
    console.log(
        "   ".repeat(idents),
        tree.element.aplToNode.type,
        tree.element.codeNode.type
    );
    tree.children.forEach((child) => {
        showTreePaired(child, idents + 1);
    });
};
