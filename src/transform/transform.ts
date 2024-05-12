import traverse from "@babel/traverse";
import * as t from "@babel/types";
import generate from "@babel/generator";
import {
    InternalDSLVariable,
    parseInternal,
    parse_with_plugins,
} from "../parser/parse";
import {
    TreeNode,
    makeTree,
    showTree,
    showTreePaired,
} from "../data_structures/tree";
import { runMatch } from "../matcher/matcher";
import { transformMatch, transformer } from "./transformMatch";
import { preludeBuilder } from "../parser/preludeBuilder";

export interface Proposal {
    pairs: TransformRecipe[];
}

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
        return transformSelfHosted(
            {
                applicableTo: recipe.applicableTo,
                transformTo: recipe.transformTo,
            },
            preludeBuilder((recipe as SelfHostedRecipe).prelude),
            code
        );
    } else {
        // We are using JSTQL
        // We have to parse JSTQL to the self hosted version

        let { cleanedJS: applicableTo, prelude } = parseInternal(
            recipe.applicableTo
        );
        let { cleanedJS: transformTo, prelude: _ } = parseInternal(
            recipe.transformTo
        );

        return transformSelfHosted(
            { applicableTo, transformTo },
            prelude,
            code
        );
    }
}

function transformSelfHosted(
    recipe: TransformRecipe,
    internals: InternalDSLVariable,
    code: string
) {
    console.log(recipe);
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
    for (let match of matches.reverse()) {
        //console.log(transformToTree.element);
        let output = structuredClone(transformToTree.element);
        try {
            transformer(match, transformToTree, output, codeAST);
        } catch (error) {
            console.log("We failed to transform an element!");
        }
    }

    console.log("Final generated code: \n");

    let output = generate(codeAST, { topicToken: "%" }).code;
    //showTree(transformToTree);

    return output;
}
