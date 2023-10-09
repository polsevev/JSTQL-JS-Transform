import * as babelparser from "../babel/packages/babel-parser/lib";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

const main = () => {
  
  let code_To_Insert = "697 + 457";

  let code = "1 + 1;";
  let ast = babelparser.parse(code);
  console.log(ast); 
  let insert_ast = babelparser.parse(code);


  traverse(ast, {
    enter(path){
      if (path.isBinaryExpression({operator: "+"})){
        path.node.operator="@@@";
      }
    },
  })
 
  console.log(JSON.stringify(ast, null, 4));
  const out = generate(ast, {}, code);
  console.log("input: " +  code);
  console.log("output: " +  out.code);
  let inout = babelparser.parse(out.code);
  console.log(inout);
  console.log(generate(inout, {}, code));
  

}


main();
