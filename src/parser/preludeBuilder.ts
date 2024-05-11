import { InternalDSLVariable, parse_with_plugins } from "./parse";

import * as t from "@babel/types";

export function preludeBuilder(prelude: string) {
    let parsedPrelude = parse_with_plugins(prelude).program.body;
    return extractValues(parsedPrelude);
}

function extractValues(types: t.Statement[]): InternalDSLVariable {
    let prelude: InternalDSLVariable = {};
    for (let stmt of types) {
        if (stmt.type == "VariableDeclaration") {
            stmt = <t.VariableDeclaration>stmt;
            let declaration = stmt.declarations[0];
            let innerDSLVariableName = (declaration.id as t.Identifier).name;
            let init = declaration.init;
            if (init) {
                if (init.type == "ArrayExpression") {
                    init = <t.ArrayExpression>init;
                    let temp = [];
                    for (let elem of init.elements) {
                        if (elem && elem.type == "Identifier") {
                            temp.push(elem.name);
                        } else {
                            throw new Error(
                                "Usage of non variable declaration in Prelude Array"
                            );
                        }
                    }
                    prelude[innerDSLVariableName] = temp;
                } else if (init.type === "Identifier") {
                    init = <t.Identifier>init;
                    prelude[innerDSLVariableName] = [init.name];
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
