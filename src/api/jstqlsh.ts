import { SelfHostedRecipe } from "../transform/transform";
import { transform } from "../transform/transform";

export function transformSH(spec: SelfHostedRecipe[], code: string) {
    let res = transform(spec, code);

    return res;
}
