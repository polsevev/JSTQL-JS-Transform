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

const path = "test_files/test2.js";
const file = Bun.file(path);
const codeFromFile = await file.text();
const main = async () => {
    //transform(selfHostedTransformExampleMultiStmt, codeFromFile);

    /*
    console.log(codeFromFile);
    const jstql_file =
        "/home/rolfmg/Coding/Master/didactic-chainsaw/dsl_files/awaitToPromise.jstql";
    const test_file = Bun.file(jstql_file);
    const test_JSTQL = await test_file.text();
    let proposals = await parseJSTQL(test_JSTQL);

    let [code, count] = transform(proposals[0].cases, codeFromFile);
    await Bun.write("output_files/test2.js", code);
    return;
    */
    let basepathExamplesJSFiles = "../next.js";
    let examples = (await readdir(basepathExamplesJSFiles, { recursive: true }))
        .filter((x) => x.endsWith(".js"))
        .map((x) => basepathExamplesJSFiles + "/" + x);
    console.log(examples);
    let result = [];
    for (let proposalFile of [
        "pipeline.jstql",
        "do.jstql",
        "awaitToPromise.jstql",
    ].slice(1, 2)) {
        const jstql_file = "dsl_files/" + proposalFile;
        const test_file = Bun.file(jstql_file);
        const test_JSTQL = await test_file.text();
        let proposals = await parseJSTQL(test_JSTQL);

        let sum = 0;
        let failures = 0;
        let filesSucceeded = 0;
        console.log("Scripts found ", sum, "matches!");
        let count = 0;
        for (let examplesFile of examples) {
            try {
                if (examplesFile.split("/").includes("compiled")) {
                    //continue;
                }
                console.log(examplesFile);
                let script = await Bun.file(examplesFile).text();
                let [resultString, matches] = transform(
                    proposals[0].cases,
                    script
                );
                sum += matches;
                console.log(matches);
                if (matches > 0) {
                    await Bun.write(
                        "output_testing/" +
                            count +
                            examplesFile.split("/").join("_"),
                        resultString
                    );
                    count += 1;
                }
                filesSucceeded += 1;
            } catch (e) {
                failures += 1;
                //console.log(e);
            }
            console.log("current sum", sum);
        }
        result.push(
            proposalFile + ", " + sum + ", " + count + ", " + filesSucceeded
        );
    }

    for (let res of result) {
        console.log(res);
    }
};

main();
