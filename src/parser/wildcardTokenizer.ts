type TokenKind =
    | "BinaryOperator"
    | "UnaryOperator"
    | "Identifier"
    | "OpeningParenthesis"
    | "ClosingParenthesis"
    | "Pluss"
    | "Semicolon";

export interface WildcardToken {
    tokenKind: TokenKind;
    value: string;
}

export class WildcardTokenizer {
    private tokens: WildcardToken[] = [];
    private current = -1; // Have to start at -1 because first iteration advances
    private source: string[];
    constructor(source: string) {
        this.source = source.split("");
    }

    tokenize(): WildcardToken[] {
        while (this.current < this.source.length - 1) {
            this.scanToken();
        }
        return this.tokens;
    }

    private peek(): string | undefined {
        return this.source[this.current + 1];
    }
    private getCurrent() {
        return this.source[this.current];
    }
    private advance() {
        this.current += 1;
    }

    private consumeToken(tokenKind: TokenKind, value: string) {
        this.tokens.push({ tokenKind, value });
    }

    private scanToken() {
        this.advance();
        let char = this.getCurrent();
        switch (char) {
            case "(": {
                this.consumeToken("OpeningParenthesis", char);
                break;
            }
            case ")": {
                this.consumeToken("ClosingParenthesis", char);
                break;
            }
            case "|": {
                if (this.peek() === "|") {
                    this.advance();
                    this.consumeToken("BinaryOperator", "||");
                } else {
                    throw new Error(
                        "Invalid token given to tokenizer: " + char
                    );
                }
                break;
            }
            case "!": {
                this.consumeToken("UnaryOperator", char);
                break;
            }
            case "&": {
                if (this.peek() === "&") {
                    this.advance();
                    this.consumeToken("BinaryOperator", "&&");
                } else {
                    throw new Error(
                        "Invalid token given to tokenizer: " + char
                    );
                }
                break;
            }
            case "+": {
                this.consumeToken("Pluss", char);
                break;
            }
            case ":": {
                this.consumeToken("Semicolon", char);
                break;
            }
            case " ":
                break;
            default:
                if (this.isAlpha(char)) {
                    this.consumeAlpha();
                    break;
                } else {
                    throw new Error("Invalid token given: " + char);
                }
        }
    }
    private consumeAlpha() {
        let word = "";

        while (true) {
            word += this.getCurrent();

            let next = this.peek();
            if (next && this.isAlpha(next)) {
                this.advance();
            } else {
                break;
            }
        }

        this.consumeToken("Identifier", word);
    }
    private isAlpha(val: string): boolean {
        let alphabet = new Set(
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split("")
        );
        return alphabet.has(val);
    }
}

function testWildcardTokenizer() {
    let tokenized = new WildcardTokenizer(
        "aiaiai: ((LOL||!Smack)&&SomethingElse)*"
    ).tokenize();

    console.log(tokenized);
}
//testWildcardTokenizer();
