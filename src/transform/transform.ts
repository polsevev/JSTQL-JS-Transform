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
import { preludeBuilder } from "../parser/preludeBuilder";
export interface TransformRecipe {
    applicableTo: string;
    transformTo: string;
}
export interface SelfHostedRecipe extends TransformRecipe {
    prelude: string;
}
export function transform(recipe: TransformRecipe, code: string) {
    if ((<SelfHostedRecipe>recipe).prelude !== undefined) {
        // We are using the self hosted version
        return transformSelfHosted(<SelfHostedRecipe>recipe, code);
    } else {
        // We are using JSTQL
        return transformJSTQL(recipe, code);
    }
}

function transformSelfHosted(recipe: SelfHostedRecipe, code: string) {
    let internals = preludeBuilder(recipe.prelude);

    let codeAST = parse_with_plugins(code);
    let codeTree = makeTree(codeAST);
    let applicabelToAST = parse_with_plugins(recipe.applicableTo);

    let applicableToTree = makeTree(applicabelToAST);
    let transformTo = parse_with_plugins(recipe.transformTo);
    let transformToTree = makeTree(transformTo);
    if (
        codeTree == undefined ||
        applicableToTree == undefined ||
        transformToTree == undefined
    ) {
        throw new Error("This no worky LOL");
    }
    showTree(applicableToTree);

    let matches = runMatch(codeTree, applicableToTree, internals);

    for (let match of matches) {
        showTreePaired(match);
        console.log(generate(match.element.codeNode).code);
    }
    console.log(matches.length);
    return;
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

function transformJSTQL(recipe: TransformRecipe, code: string) {
    let { prelude, cleanedJS } = parseInternal(recipe.applicableTo);
    let codeAST = parse_with_plugins(code);
    let codeTree = makeTree(codeAST);
    let applicabelToAST = parse_with_plugins(cleanedJS);
    console.dir(applicabelToAST, { depth: null });
    let applicableToTree = makeTree(applicabelToAST);
    let transformTo = parse_with_plugins(recipe.transformTo);
    let transformToTree = makeTree(transformTo);

    if (
        codeTree == undefined ||
        applicableToTree == undefined ||
        transformToTree == undefined
    ) {
        throw new Error("This no worky LOL");
    }

    let matches = runMatch(codeTree, applicableToTree, prelude);

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
