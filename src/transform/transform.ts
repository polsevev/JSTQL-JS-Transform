import traverse from "@babel/traverse";
import * as t from "@babel/types";
import generate from "@babel/generator";
import {
    Wildcard,
    parseInternalAplTo,
    parseInternalTraTo,
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
import * as babelparser from "@babel/parser";
export interface Proposal {
    cases: TransformRecipe[];
}

export interface TransformRecipe {
    applicableTo: string;
    transformTo: string;
}
export interface SelfHostedRecipe extends TransformRecipe {
    prelude: string;
}
export function transform(recipes: TransformRecipe[], code: string): string {
    let codeAST: t.Node = parse_with_plugins(code);

    for (let recipe of recipes) {
        if ((<SelfHostedRecipe>recipe).prelude !== undefined) {
            // We are using the self hosted version
            codeAST = transformSelfHosted(
                {
                    applicableTo: recipe.applicableTo,
                    transformTo: recipe.transformTo,
                },
                preludeBuilder((recipe as SelfHostedRecipe).prelude),
                codeAST
            );
        } else {
            // We are using JSTQL
            // We have to parse JSTQL to the self hosted version

            let { cleanedJS: applicableTo, prelude } = parseInternalAplTo(
                recipe.applicableTo
            );
            let transformTo = parseInternalTraTo(recipe.transformTo);

            codeAST = transformSelfHosted(
                { applicableTo, transformTo },
                prelude,
                codeAST
            );
        }
    }

    let output = generate(codeAST, { topicToken: "%" }).code;
    //showTree(transformToTree);
    return output;
}

function transformSelfHosted(
    recipe: TransformRecipe,
    internals: Wildcard[],
    codeAST: t.Node
): t.Node {
    let codeTree = makeTree(codeAST as babelparser.ParseResult<t.File>);
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

    let matches = runMatch(codeTree, applicableToTree, internals);
    console.log("We found", matches.length, "matches");
    let outputAST = transformer(matches, transformToTree, codeAST, transformTo);
    return outputAST;
}
