import * as babelparser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

const main = () => {
  
  let code_To_Insert = "697 + 457";

  let code = "let n = 1 - 1;";
  let ast:babelparser.ParseResult<File> = babelparser.parse(code);
  console.log(ast); 
  let insert_ast = babelparser.parse(code);

  traverse(ast, {
    enter(path:any) {

      if (path.isBinaryExpression({operator: "+"})){
        
      }
    }
  })

  traverse(ast, {
    enter(path:any){
      if (path.isBinaryExpression({operator: "+"})){
        path.node.operator="@@@";
      }
    },
  })
 
  console.log(ast)
  const output = generate(ast, {}, code);
  console.log("input: " +  code);
  console.log("output: " +  output.code);
  //let inout = babelparser.parse(output.code);
  //console.log(inout);
  
  let awaitex = babelparser.parse("async function a(){let b = await c();}async function c(){return 1; }");
  console.log(JSON.stringify(awaitex));

  traverse(awaitex, {

  })
}


main();
