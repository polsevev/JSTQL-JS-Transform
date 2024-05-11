import { TransformRecipe } from "../transform/transform";

export function parseJSTQL(jstql: string): TransformRecipe {
    console.log((await parseDSLtoAST(test_JSTQL)).proposals[0].code);
}
