//import * as babelparser from "../babel/packages/babel-parser";
import * as babelparser from "@babel/parser";
//import core from "../babel/packages/babel-core";
import { parse_with_plugins } from "./parser/parse";
import { TransformRecipe, transform } from "./transform/transform";
/*
proposal await_to_promise {
    applicable to {
        let a = await b();
        <<REST:rest>>
    }

    transform to {
        b().then((a) => {
            <<REST:rest>>
        })
    }

}
*/

/*
// Status quo
var minLoc = Object.keys( grunt.config( "uglify.all.files" ) )[ 0 ];

// With pipes
var minLoc = grunt.config('uglify.all.files') |> Object.keys(%)[0];


proposal pipeline_simple{
    applicable to {
        var minLoc = Object.keys( grunt.config( "uglify.all.files" ) )[ 0 ];
    }

    transform to {
        var minLoc = grunt.config('uglify.all.files') |> Object.keys(%)[0];
    }
}

*/

/*

an example of what this will hit: 
Unary function calls test(1);

proposal pipeline_simple{
    applicable to {
        <<a:Callable>>(<<b>>);
        console.log(<<b:Literal>>)
    }

    transform to {
        b |> a(%);
    }
}

*/

const transformExample: TransformRecipe = {
    applicableTo: `<<a>>(<<b:Expression|Identifier>>);`,
    transformTo: "b |> a(%)",
};
const code =
    "a(something);a(1+1);something(some_other_thing + 1 + 10 + 100); console.log(a)";

// Expected outcome: 3 correct matches
const secondTransformExample: TransformRecipe = {
    applicableTo: `<<a>>.<<b>>(<<c:Expression|Identifier>>);`,
    transformTo: "c |> a.b(%);",
};
const code2 = `console.log(a);something.sometingOther(b(c));some.thing(1+1);a(b)`;

// Expected outcome: 1 correct match
const thirdTransformExample: TransformRecipe = {
    applicableTo: `myFunction(<<a:Expression|Identifier>>)`,
    transformTo: `a |> myFunction(%)`,
};
const code3 = `myFunction(a);otherFunction(a); myFunction.otherfunction(a)`;

// Expected outcome: 3 correct matches
const simpleTransformExample: TransformRecipe = {
    applicableTo: `<<a>>.<<b>>(<<something:Identifier|Expression>>)`,
    transformTo: `something |> a.b(%)`,
};

const test: TransformRecipe = {
    applicableTo: "let <<x>> = 0;",
    transformTo: "if (true) {console.log(<<x>>)};",
};
const path = "../test.js";
const file = Bun.file(path);
const codeFromFile = await file.text();
const main = async () => {
    await Bun.write(
        "../output.js",
        transform(simpleTransformExample, codeFromFile)
    );
};

main();
