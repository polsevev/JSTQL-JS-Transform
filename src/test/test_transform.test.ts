import { expect, test } from "bun:test";
import { TransformRecipe, transform } from "../transform/transform";

const transformExample: TransformRecipe = {
    applicableTo: `<<a>>(<<b:Identifier|Expression>>);`,
    transformTo: "b |> a(%)",
};
const code =
    "a(something);a(1+1);something(some_other_thing + 1 + 10 + 100); console.log(a)";

test("Test code: " + code + " on " + transformExample.applicableTo, () => {
    expect(transform(transformExample, code).length).toBe(
        "something |> a(%);1 + 1 |> a(%);some_other_thing + 1 + 10 + 100 |> something(%);console.log(a);"
    );
});
// Expected outcome: 3 correct matches
const secondTransformExample: TransformRecipe = {
    applicableTo: `<<a>>.<<b>>(<<c:Expression|Identifier>>);`,
    transformTo: "c |> a.b(%);",
};
const code2 = `console.log(a);something.sometingOther(b(c));some.thing(1+1); a(b)`;
test(
    "Test code: " + code2 + " on " + secondTransformExample.applicableTo,
    () => {
        expect(transform(secondTransformExample, code2).length).toBe(3);
    }
);
// Expected outcome: 1 correct match
const thirdTransformExample: TransformRecipe = {
    applicableTo: `myFunction(<<a:Expression|Identifier>>)`,
    transformTo: `a |> myFunction(%)`,
};
const code3 = `myFunction(a);otherFunction(a); myFunction.otherfunction(a)`;
test(
    "Test code: " + code3 + " on " + thirdTransformExample.applicableTo,
    () => {
        expect(transform(thirdTransformExample, code3)).toBe(``);
    }
);
