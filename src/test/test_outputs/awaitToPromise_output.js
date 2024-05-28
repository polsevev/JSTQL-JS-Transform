async function something() {
  let a = 100;
  a *= 100000;
  return fetch("https://uib.no").then(async uib => {
    a += 100000;
    a -= 1000;
    return [a, uib];
  });
}