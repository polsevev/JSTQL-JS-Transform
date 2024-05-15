import { Wildcard, WildcardParser, parse_with_plugins } from "./parse";

import * as t from "@babel/types";
import { WildcardTokenizer } from "./wildcardTokenizer";

export function preludeBuilder(prelude: string) {
    let parsedPrelude = parse_with_plugins(prelude).program.body;
    return extractValues(parsedPrelude);
}

function extractValues(types: t.Statement[]): Wildcard[] {
    let prelude: Wildcard[] = [];
    for (let stmt of types) {
        if (stmt.type == "VariableDeclaration") {
            stmt = <t.VariableDeclaration>stmt;
            let declaration = stmt.declarations[0];
            let innerDSLVariableName = (declaration.id as t.Identifier).name;
            let init = declaration.init;
            if (init) {
                if (init.type == "StringLiteral") {
                    init = <t.StringLiteral>init;
                    prelude.push(
                        new WildcardParser(
                            new WildcardTokenizer(
                                innerDSLVariableName + ":" + init
                            ).tokenize()
                        ).parse()
                    );
                } else {
                    throw new Error(
                        "Invalid usage of right side declaration in prelude"
                    );
                }
            } else {
                throw new Error("Empty wildcards are not legal");
            }
        } else {
            throw new Error("Usage of non VariableDeclaration in Prelude");
        }
    }

    return prelude;
}
