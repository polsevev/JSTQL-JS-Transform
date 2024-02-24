import * as babelparser from "@babel/parser";

import * as t from "@babel/types";

export interface InternalDSLVariable {
    type: string[];
    dsl_name: string;
}

export interface InternalParseResult {
    internals: Map<string, InternalDSLVariable>;
    cleanedJS: string;
}

export function parseInternal(applicableTo: string): InternalParseResult {
    let lastChar: null | string = null;
    let inDslParseMode = false;

    let inDslParseString = "";

    let internalParseResult: InternalParseResult = {
        internals: new Map(),
        cleanedJS: "",
    };

    for (let char of applicableTo) {
        if (inDslParseMode) {
            if (char == ">" && lastChar == ">") {
                //remove first closing >
                inDslParseString = inDslParseString.slice(0, -1);
                let { identifier, type, replaceWith } =
                    parseInternalString(inDslParseString);
                internalParseResult.cleanedJS += replaceWith;
                internalParseResult.internals.set("___" + identifier, {
                    type: type,
                    dsl_name: identifier,
                });
                inDslParseString = "";
                inDslParseMode = false;
                continue;
            }

            inDslParseString += char;
        } else {
            if (char == "<" && lastChar == "<") {
                //Remove previous <
                internalParseResult.cleanedJS =
                    internalParseResult.cleanedJS.slice(0, -1);
                inDslParseMode = true;
                continue;
            }

            internalParseResult.cleanedJS += char;
        }

        lastChar = char;
    }

    return internalParseResult;
}

function parseInternalString(dslString: string) {
    let splitted = dslString.split(":");

    return {
        identifier: splitted[0],
        type: splitted.length > 1 ? splitted[1].split("|") : [""],
        replaceWith: "___" + splitted[0],
    };
}

export function parse_with_plugins(
    code: string
): babelparser.ParseResult<t.File> {
    return babelparser.parse(code, {
        plugins: [["pipelineOperator", { proposal: "hack", topicToken: "%" }]],
    });
}
