import swc, { printSync } from "@swc/core";
import { MatchScript } from "./types";
import { from, to } from "./patterns/patterns";

const PATTERN_PATH = "src/patterns/test.json";

const main = async () => {
  console.log(Bun.version);

  let inputFile = await Bun.file("src/test_files/simple.js").text();
  console.log("Hello!");

  const hello = "lol";

  console.log(
    "=====================\nCurrent file to be transformed : \n" +
      inputFile +
      "\n====================",
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

//    console.log(module.body);

    matchStatements(module).then((a) => {
      console.log(
        "================\nOutput code: \n" +
          a +
          "\n========================",
      );
    });
  });
};

const matchStatements = async (module: swc.Script) => {
  let fromLocal = from;
  let toLocal = to;

  return match(fromLocal, toLocal, module.body);
};

enum MatchingResults{
  FULL,
  PARTIAL,
  SINGLE,
  NONE
}

const match = (from: any, to: any, module: swc.Statement[]): any => {
  
  let curMatchType = MatchingResults.NONE;

  for (const [key, value] of Object.entries(module)){
    if (from[key] && key != "span"){
      console.log(from[key] + " == " + value);
      if (from[key] == value){
console.log("Found valid key with " + key);
      
      let matchRes = match(from[key], to, value);
      if (matchRes == MatchingResults.FULL){
        curMatchType = MatchingResults.FULL;
      }

      }
          }
  }

  return curMatchType;
};



main();
