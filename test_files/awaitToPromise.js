async function something() {
    let a = 100;
    a *= 100000;
    let uib = await fetch("https://uib.no");
    a += 100000;
    a -= 1000;
    return [a, uib];
}
