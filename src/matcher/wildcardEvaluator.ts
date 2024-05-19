import * as t from "@babel/types";
import {
    BinaryExpr,
    GroupExpr,
    Identifier,
    TypeExpr,
    UnaryExpr,
    Wildcard,
    WildcardNode,
    WildcardParser,
} from "../parser/parse";
import { WildcardTokenizer } from "../parser/wildcardTokenizer";

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
                } else if (cur.name === "Statement") {
                    return t.isStatement(toComp);
                }
                return cur.name === toComp.type;
            }
        }
    }
}

function testWildcardEval() {
    console.log(
        WildcardEvalVisitor.visit(
            new WildcardParser(
                new WildcardTokenizer(
                    "statements:(Statement && !ReturnStatement)*"
                ).tokenize()
            ).parse().expr,
            t.variableDeclaration("let", [
                t.variableDeclarator(t.identifier("Id"), null),
            ])
        )
    );
}
