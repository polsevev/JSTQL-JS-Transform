import * as babelparser from "../babel/packages/babel-parser";
import { parseApplicableTo } from "./parser/parse";
import { TransformRecipe, transform } from "./transform/transform";
/*
proposal await_to_promise {
    applicable to {
        let a = await b();
        <<CONSUME>>
    }

    transform to {
        b().then((a) => {
            console.log(a);
        })
    }

}
*/

const transformExample:TransformRecipe = {
    applicableTo: `let a = await b();<<REST_BLOCK:rest>>`,
    consumeBlock: true,
    identifiers: ["b", "a", "rest"],
    transformTo: "b().then((a) => {<<REST_BLOCK:rest>>})"
}
const code = "let a = await b(); console.log(a);"

const main = (): void => {
    transform(transformExample, code);

    

    
};

main();
