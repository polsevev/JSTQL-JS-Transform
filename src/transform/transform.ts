import traverse from "@babel/traverse";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { parseInternal, parse_with_plugins } from "../parser/parse";
import {
    TreeNode,
    makeTree,
    showTree,
    showTreePaired,
} from "../data_structures/tree";
import { runMatch } from "../matcher/matcher";
import { transformMatch, transformer } from "./transformMatch";
export interface TransformRecipe {
    applicableTo: string;
    transformTo: string;
}
export function transform(recipe: TransformRecipe, code: string) {
    let { internals, cleanedJS } = parseInternal(recipe.applicableTo);
    let codeAST = parse_with_plugins(code);
    let codeTree = makeTree(codeAST);
    let applicabelToAST = parse_with_plugins(cleanedJS);
    let applicableToTree = makeTree(applicabelToAST);
    let transformTo = parse_with_plugins(recipe.transformTo);
    let transformToTree = makeTree(transformTo);

    console.log();

    if (
        codeTree == undefined ||
        applicableToTree == undefined ||
        transformToTree == undefined
    ) {
        throw new Error("This no worky LOL");
    }

    let matches = runMatch(codeTree, applicableToTree, internals);

    for (let match of matches) {
        //console.log(transformToTree.element);
        let output = structuredClone(transformToTree.element);
        try {
            transformer(match, transformToTree, output, codeAST);
        } catch (error) {
            console.log("We failed to transform an element!");
        }
        //let result = generate(transformToTreeClone.element);
        //console.log(output);
        console.log(generate(match.element.codeNode).code, "is turned into:");
        console.log(generate(output, { topicToken: "%" }).code);
        //console.log(generate(codeAST, { topicToken: "%" }).code);
        console.log("\n");
    }

    console.log("Final generated code: \n");

    let output = generate(codeAST, { topicToken: "%" }).code;
    //showTree(transformToTree);

    return output;
}
