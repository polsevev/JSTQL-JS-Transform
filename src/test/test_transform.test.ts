import { expect, test } from "bun:test";
import { TransformRecipe, transform } from "../transform/transform";
import { parseJSTQL } from "../langium/langiumRunner";

async function runTest(inputJS: string, inputJSTQL: string): Promise<string> {
    //transform(selfHostedTransformExampleMultiStmt, codeFromFile);
    const file = Bun.file(inputJS);
    const codeFromFile = await file.text();

    const test_file = Bun.file(inputJSTQL);
    const test_JSTQL = await test_file.text();
    let proposals = await parseJSTQL(test_JSTQL);

    let code = transform(proposals[0].cases, codeFromFile);
    return code;
}
let pipelineRes = await runTest(
    "test_files/pipeline_test.js",
    "dsl_files/pipeline.jstql"
);
let pipelineResFile = await Bun.file(
    "src/test/test_outputs/pipeline_output.js"
).text();
test("Test code: pipeline", () => {
    expect(pipelineRes).toBe(pipelineResFile);
});
let doRes = await runTest("test_files/do_test.js", "dsl_files/do.jstql");

let doResFile = await Bun.file("src/test/test_outputs/do_output.js").text();
test("Test code: do", () => {
    expect(doRes).toBe(doResFile);
});

let awaitToPromise = await runTest(
    "test_files/awaitToPromise.js",
    "dsl_files/awaitToPromise.jstql"
);

let awaitToPromiseOutput = await Bun.file(
    "src/test/test_outputs/awaitToPromise_output.js"
).text();
test("Test code: await to promise", () => {
    expect(awaitToPromise).toBe(awaitToPromiseOutput);
});
