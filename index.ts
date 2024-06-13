
import {

    transform,
} from "./src/transform/transform";
import { parseJSTQL } from "./src/langium/langiumRunner";
import { parseArgs } from "util";

const { values: argVals, tokens: positional } = parseArgs({
    options: {
        o: {
            type: "string",
        },
    },
    tokens: true,
    allowPositionals: true,
});
const main = async () => {
    //transform(selfHostedTransformExampleMultiStmt, codeFromFile);
    console.log(positional);
    console.log(argVals);
    if (!positional) {
        throw new Error("Something is wrong with args");
    }
    if (
        !positional[0] &&
        positional[0].kind === "positional" &&
        !positional[0].value.endsWith(".jstql")
    ) {
        throw new Error("First positional argument is current JSTQL file");
    }
    if (!positional[1] || !positional[1].value.endsWith(".js")) {
        throw new Error(
            "Second positional argument is JS code to be transformed"
        );
    }
    const jstql_file = positional[0].value;
    const code_file = positional[1].value;

    let jstqlString = await Bun.file(jstql_file).text();
    let codeString = await Bun.file(code_file).text();

    let parsedJSTQL = await parseJSTQL(jstqlString);

    for (let proposal of parsedJSTQL) {
        let [resultString, matches] = transform(proposal.cases, codeString);
        let path = "./out.js";
        if (argVals["o"]) {
            path = argVals["o"];
        }
        await Bun.write(path, resultString);
    }
};

main();
