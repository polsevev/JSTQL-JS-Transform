let something = Iterator.from([1, 2, 3]);
let someOtherThing = Iterator.from([4, 5, 6]);
let generate = Iterator.concat(something, someOtherThing);