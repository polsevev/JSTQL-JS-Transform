import swc from "@swc/core";
import { MatchScript } from "./types";

const PATTERN_PATH = "src/patterns/test.json";

const main = async () => {
    console.log(Bun.version);

    let inputFile = await Bun.file("src/test_files/simple.js").text();

    console.log(
        "=====================\nCurrent file to be transformed : \n" +
            inputFile +
            "\n===================="
    );
    swc.parseFile("src/test_files/simple.js", {
        syntax: "ecmascript",
        jsx: false,

        target: "es2022",

        isModule: false,
    }).then((module) => {
        //console.log(module);
        //   swc.print(module).then((o: swc.Output) => {
        //     console.log(o);
        //   });

        console.log(module.body);

        matchStatements(module).then((a) => {
            console.log(
                "================\nOutput code: \n" +
                    a.code +
                    "\n========================"
            );
        });
    });
};

const matchStatements = async (module: swc.Script) => {
    const patternFile = Bun.file(PATTERN_PATH);
    const [from, to]: [MatchScript, MatchScript] = JSON.parse(
        await patternFile.text()
    );
    return await swc.printSync(match(from, to, module));
};

const match = (from: any, to: any, module: swc.Script): swc.Script => {
    console.log(to);
    console.log(module);
    console.log(from);

    for (const obj of module.body) {
        let allPresent = true;
        for (const key in obj) {
            if (!(key in from)) {
                allPresent = false;
            }
        }
        if (allPresent) {
            console.log("Found first match!");
            for (const [key, val] of Object.entries(obj)) {
                match(from["key"], to, val);
            }
        }
    }

    return module;
};

const matchAndReplace = (
    statement: swc.Statement,
    from: Object,
    to: Object
) => {
    for (const [key, value] of Object.entries(from)) {
    }
};

main();
