import * as t from "@babel/types";
import {
    BinaryExpr,
    GroupExpr,
    Identifier,
    TypeExpr,
    UnaryExpr,
    Wildcard,
    WildcardNode,
} from "../parser/parse";

export class WildcardEvalVisitor {
    static visit(node: WildcardNode, toComp: t.Node): boolean {
        switch (node.nodeType) {
            case "BinaryExpr": {
                let cur = node as BinaryExpr;
                let left = this.visit(cur.left, toComp);
                let right = this.visit(cur.right, toComp);
                if (cur.op === "&&") {
                    return left && right;
                } else {
                    return left || right;
                }
            }
            case "UnaryExpr": {
                let cur = node as UnaryExpr;
                return !this.visit(cur.expr, toComp);
            }
            case "GroupExpr": {
                let cur = node as GroupExpr;
                return this.visit(cur.expr, toComp);
            }
            case "Identifier": {
                let cur = node as Identifier;
                if (cur.name === "Expression") {
                    return t.isExpression(toComp);
                }
                return cur.name === toComp.type;
            }
        }
    }
}
