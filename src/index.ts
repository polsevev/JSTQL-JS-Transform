//import * as babelparser from "../babel/packages/babel-parser";
import * as babelparser from "@babel/parser";
//import core from "../babel/packages/babel-core";
import { parse_with_plugins } from "./parser/parse";
import {
    SelfHostedRecipe,
    TransformRecipe,
    transform,
} from "./transform/transform";
import { readdir } from "node:fs/promises";
import { parseJSTQL } from "./langium/langiumRunner";

const dir = "../prettier/src";

const path = "test_files/pipeline_test.js";
const file = Bun.file(path);
const codeFromFile = await file.text();
const main = async () => {
    //transform(selfHostedTransformExampleMultiStmt, codeFromFile);
    /*
    console.log(codeFromFile);
    const jstql_file =
        "/home/rolfmg/Coding/Master/didactic-chainsaw/dsl_files/pipeline.jstql";
    const test_file = Bun.file(jstql_file);
    const test_JSTQL = await test_file.text();
    let proposals = await parseJSTQL(test_JSTQL);

    let [code, count] = transform(proposals[0].cases, codeFromFile);
    await Bun.write("output_files/pipeline_out.js", code);
    return;
    */
    const jstql_file =
        "/home/rolfmg/Coding/Master/didactic-chainsaw/dsl_files/pipeline.jstql";
    const test_file = Bun.file(jstql_file);
    const test_JSTQL = await test_file.text();
    let proposals = await parseJSTQL(test_JSTQL);

    let basepathExamplesJSFiles = "../next.js";
    let examples = (await readdir(basepathExamplesJSFiles, { recursive: true }))
        .filter((x) => x.endsWith(".js"))
        .map((x) => basepathExamplesJSFiles + "/" + x);
    console.log(examples);

    let sum = 0;
    console.log("Scripts found ", sum, "matches!");
    let count = 0;
    for (let examplesFile of examples) {
        try {
            if (examplesFile.split("/").includes("compiled")) {
                continue;
            }
            console.log(examplesFile);
            let script = await Bun.file(examplesFile).text();
            let [resultString, matches] = transform(proposals[0].cases, script);
            sum += matches;
            if (matches > 0) {
                await Bun.write(
                    "output_testing/" + count + examplesFile.split("/").at(-1),
                    resultString
                );
                count += 1;
            }
        } catch (e) {
            console.log("Failed");
        }
        console.log("current sum", sum);
    }
    console.log(sum);
};

main();
