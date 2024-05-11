import * as babelparser from "@babel/parser";

import * as t from "@babel/types";

export interface InternalDSLVariable {
    [internals: string]: string[];
}

export interface InternalParseResult {
    prelude: InternalDSLVariable;
    cleanedJS: string;
}

export function parseInternal(code: string): InternalParseResult {
    let cleanedJS = "";
    let temp = "";
    let flag = false;
    let prelude: InternalDSLVariable = {};

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
            let { identifier, types } = parseInternalString(temp);

            cleanedJS += identifier;

            prelude[identifier] = types;
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

function parseInternalString(dslString: string): {
    identifier: string;
    types: string[];
} {
    let [identifier, typeString, ..._] = dslString
        .replace(/\s/g, "")
        .split(":");

    if (_.length > 0) {
        // This is an error, and it means we probably have encountered two bitshift operators
        throw new Error("Probably encountered bitshift");
    }

    return {
        identifier,
        types: typeString.length > 0 ? typeString.split("|") : [""],
    };
}

export function parse_with_plugins(
    code: string
): babelparser.ParseResult<t.File> {
    return babelparser.parse(code, {
        plugins: [["pipelineOperator", { proposal: "hack", topicToken: "%" }]],
    });
}

function testParseInternal() {
    parseInternal(`
        <<a:Identifier>>(<< b : Identifier | MemberExpression >>);
    `);
}
testParseInternal();
