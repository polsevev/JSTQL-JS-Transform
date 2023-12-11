
import * as babelparser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

import { parseApplicableTo } from "../parser/parse";
export interface TransformRecipe{
    applicableTo: string,
    identifiers: string[],
    consumeBlock: boolean,
    transformTo: string,
}
export function transform(recipe: TransformRecipe, code:string){
    
    let {commands, applicableTo} = parseApplicableTo(recipe.applicableTo);
    
    
    //console.log(applicableTo);

    let applicableToAST = babelparser.parse(applicableTo, {allowAwaitOutsideFunction: true});
    console.log(applicableToAST);

    let codeAST = babelparser.parse(code, {allowAwaitOutsideFunction: true});
    console.log(codeAST);




    traverse(applicableToAST, {
        enter(path:any) {
            traverse(codeAST, {
                enter(codePath:any){
                    if (codePath.node.type === "Program"){
                        return;
                    }
                    if (codePath.node.type === path.node.type){
                        console.log("We found a match with");
                        console.log(codePath.node);
                    }
                }
            })
        }
    })
}





