import * as babelparser from "@babel/parser";

import * as t from "@babel/types";
import { WildcardToken, WildcardTokenizer } from "./wildcardTokenizer";

export interface InternalParseResult {
    prelude: Wildcard[];
    cleanedJS: string;
}

export function parseInternalTraTo(code: string): string {
    let cleanedJS = "";
    let temp = "";
    let flag = false;
    for (let i = 0; i < code.length; i++) {
        if (code[i] === "<" && code[i + 1] === "<") {
            // From now in we are inside of the DSL custom block
            flag = true;
            i += 1;
            continue;
        }

        if (flag && code[i] === ">" && code[i + 1] === ">") {
            // We encountered a closing tag
            flag = false;

            cleanedJS += temp;

            i += 1;
            temp = "";
            continue;
        }

        if (flag) {
            temp += code[i];
        } else {
            cleanedJS += code[i];
        }
    }
    return cleanedJS;
}

export function parseInternalAplTo(code: string): InternalParseResult {
    let cleanedJS = "";
    let temp = "";
    let flag = false;
    let prelude: Wildcard[] = [];
    for (let i = 0; i < code.length; i++) {
        if (code[i] === "<" && code[i + 1] === "<") {
            // From now in we are inside of the DSL custom block
            flag = true;
            i += 1;
            continue;
        }

        if (flag && code[i] === ">" && code[i + 1] === ">") {
            // We encountered a closing tag
            flag = false;
            let wildcard = new WildcardParser(
                new WildcardTokenizer(temp).tokenize()
            ).parse();

            cleanedJS += wildcard.identifier.name;

            prelude.push(wildcard);
            i += 1;
            temp = "";
            continue;
        }

        if (flag) {
            temp += code[i];
        } else {
            cleanedJS += code[i];
        }
    }
    return { prelude, cleanedJS };
}

export interface Identifier extends WildcardNode {
    nodeType: "Identifier";
    name: string;
}

export interface Wildcard {
    nodeType: "Wildcard";
    identifier: Identifier;
    expr: TypeExpr;
    star: boolean;
}

export interface WildcardNode {
    nodeType: "BinaryExpr" | "UnaryExpr" | "GroupExpr" | "Identifier";
}

export type TypeExpr = BinaryExpr | UnaryExpr | PrimitiveExpr;

export type BinaryOperator = "||" | "&&";

export type UnaryOperator = "!";

export interface BinaryExpr extends WildcardNode {
    nodeType: "BinaryExpr";
    left: UnaryExpr | BinaryExpr | PrimitiveExpr;
    op: BinaryOperator;
    right: UnaryExpr | BinaryExpr | PrimitiveExpr;
}
export interface UnaryExpr extends WildcardNode {
    nodeType: "UnaryExpr";
    op: UnaryOperator;
    expr: PrimitiveExpr;
}

export type PrimitiveExpr = GroupExpr | Identifier;

export interface GroupExpr extends WildcardNode {
    nodeType: "GroupExpr";
    expr: TypeExpr;
}

class WildcardParser {
    private position = -1;

    constructor(private tokens: WildcardToken[]) {}
    private getCurrentToken() {
        // 1. Return the element of array `tokens` at the current position.
        return this.tokens[this.position];
    }

    private advance(): void {
        // 1. Increment the value of `currentPosition` by 1.
        this.position += 1;
    }

    private peek() {
        // 1. Return the element of array `tokens` at a position immediately after the current position.
        return this.tokens[this.position + 1];
    }

    private error() {
        return new Error(
            "Parsing failed at position: " +
                this.position +
                ". The erroneous input token is: " +
                this.getCurrentToken().value
        );
    }

    parse(): Wildcard {
        return this.Wildcard();
    }

    private Wildcard(): Wildcard {
        let identifier = this.Identifier();
        this.Semicolon();
        let multidenoted = this.TypeExpr();
        let star = this.Star();
        return {
            nodeType: "Wildcard",
            identifier,
            expr: multidenoted,
            star,
        };
    }

    private Star(): boolean {
        if (this.peek() && this.peek().tokenKind === "Star") {
            this.advance();
            return true;
        } else {
            return false;
        }
    }

    private TypeExpr(): TypeExpr {
        if (this.peek().tokenKind === "UnaryOperator") {
            return this.UnaryExpr();
        } else {
            return this.BinaryExpr();
        }
    }

    private BinaryExpr(): BinaryExpr | UnaryExpr | PrimitiveExpr {
        let left: UnaryExpr | BinaryExpr | PrimitiveExpr = this.UnaryExpr();
        while (this.peek() && this.peek().tokenKind === "BinaryOperator") {
            let op = this.BinaryOperator();
            let right = this.UnaryExpr();
            left = {
                nodeType: "BinaryExpr",
                left,
                op,
                right,
            };
        }

        return left;
    }

    private BinaryOperator(): BinaryOperator {
        if (this.peek().tokenKind === "BinaryOperator") {
            this.advance();
            return this.getCurrentToken().value as BinaryOperator;
        } else throw this.error();
    }

    private UnaryExpr(): UnaryExpr | PrimitiveExpr {
        if (this.peek().tokenKind === "UnaryOperator") {
            let UnaryOperator = this.UnaryOperator();
            let expr = this.PrimitiveExpr();
            return {
                nodeType: "UnaryExpr",
                op: UnaryOperator,
                expr,
            };
        } else {
            return this.PrimitiveExpr();
        }
    }

    private UnaryOperator(): UnaryOperator {
        if (this.peek().tokenKind === "UnaryOperator") {
            this.advance();
            return this.getCurrentToken().value as UnaryOperator;
        } else throw this.error();
    }

    private PrimitiveExpr(): PrimitiveExpr {
        if (this.peek().tokenKind === "OpeningParenthesis") {
            return this.GroupExpr();
        } else {
            return this.Identifier();
        }
    }

    private GroupExpr(): GroupExpr {
        this.OpeningParenthesis();
        let expr = this.TypeExpr();
        this.ClosingParenthesis();
        return {
            nodeType: "GroupExpr",
            expr,
        };
    }

    private OpeningParenthesis() {
        if (this.peek().tokenKind === "OpeningParenthesis") {
            this.advance();
        } else throw this.error();
    }
    private ClosingParenthesis() {
        if (this.peek().tokenKind === "ClosingParenthesis") {
            this.advance();
        } else throw this.error();
    }

    private Semicolon() {
        if (this.peek().tokenKind === "Semicolon") {
            this.advance();
        } else {
            throw this.error();
        }
    }
    private Identifier(): Identifier {
        if (this.peek().tokenKind === "Identifier") {
            this.advance();
            return {
                nodeType: "Identifier",
                name: this.getCurrentToken().value,
            };
        } else throw this.error();
    }
}

export function parse_with_plugins(
    code: string
): babelparser.ParseResult<t.File> {
    return babelparser.parse(code, {
        plugins: [["pipelineOperator", { proposal: "hack", topicToken: "%" }]],
    });
}

function testParser() {
    console.dir(
        parseInternalAplTo(
            "<<someFunctionIdent:Identifier || MemberExpression>>(<<someFunctionParam: Expression || Identifier>>);"
        ),
        { depth: null }
    );

    console.dir(
        parseInternalAplTo("<<SomeIdent: Statement && !ReturnStatement >>"),
        {
            depth: null,
        }
    );
}

//testParser();
