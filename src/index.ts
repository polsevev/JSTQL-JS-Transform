//import * as babelparser from "../babel/packages/babel-parser";
import * as babelparser from "@babel/parser";
//import core from "../babel/packages/babel-core";
import { parse_with_plugins } from "./parser/parse";
import {
    SelfHostedRecipe,
    TransformRecipe,
    transform,
} from "./transform/transform";

import { parseJSTQL } from "./langium/langiumRunner";

const dir = "../prettier/src";

const path = "../prettier/src/index.js";
const file = Bun.file(path);
const codeFromFile = await file.text();
const main = async () => {
    //transform(selfHostedTransformExampleMultiStmt, codeFromFile);
    console.log(codeFromFile);
    const jstql_file =
        "/home/rolfmg/Coding/Master/didactic-chainsaw/dsl_files/pipeline.jstql";
    const test_file = Bun.file(jstql_file);
    const test_JSTQL = await test_file.text();
    let proposals = await parseJSTQL(test_JSTQL);

    let code = transform(proposals[0].cases, codeFromFile);
    await Bun.write("output_files/testingLOL.js", code);
};

main();
