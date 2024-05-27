function parse() {
  const input = ("input" |> document.getElementById(%)).value;
  const data = 32 |> input.slice(%);
  const compressedData = data |> decode_base64(%);
  const uncompressed = compressedData |> pako.inflate(%, {
    to: "string"
  });
  const json = uncompressed |> JSON.parse(%);
  json |> console.log(%);
  json |> convertToDesktop(%);
}
function convertToDesktop(json) {
  const newValues = {
    crb: false,
    newClanRaidClassId: 0,
    newClanRaidClassLevel: 0,
    pendingImmortalSouls: 0,
    pendingRaidRubies: 0,
    immortalSouls: 0,
    lastPurchaseTime: 0,
    lastRaidAttemptTimestamp: 0,
    lastRaidRewardCheckTimestamp: 0,
    shouldShowHZERoster: false,
    lastBonusRewardCheckTimestamp: 0
  };
  const mappedValues = {
    rubies: json.rubies / 10 |> Math.round(%)
  };
  const pcSpecificValues = {
    readPatchNumber: "1.0e12",
    saveOrigin: "pc"
  };
  const hash = "7a990d405d2c6fb93aa8fbb0ec1a3b23";
  const newData = {
    ...newValues,
    ...json,
    ...mappedValues,
    ...pcSpecificValues
  };
  const compressed = newData |> JSON.stringify(%) |> pako.deflate(%, {
    to: "string"
  });
  const base64 = compressed |> btoa(%);
  const finalSaveString = hash + base64;
  ("output_output" |> document.getElementById(%)).innerText = finalSaveString;
  showOutput();
}
function showOutput() {
  ("outputs" |> document.getElementById(%)).style.visibility = "visible";
}
function copyOutput() {
  const output = "output_output" |> document.getElementById(%);
  output.disabled = false;
  output.focus();
  output.select();
  "copy" |> document.execCommand(%);
  output.disabled = true;
  const successElement = "copy_success_msg" |> document.getElementById(%);
  successElement.style.visibility = "visible";
  (() => successElement.style.visibility = "hidden") |> setTimeout(%, 4000);
}
function decode_base64(s) {
  let e = {},
    i,
    k,
    v = [],
    r = "",
    w = String.fromCharCode;
  let n = [[65, 91], [97, 123], [48, 58], [43, 44], [47, 48]];
  for (z in n) {
    for (i = n[z][0]; i < n[z][1]; i++) {
      i |> w(%) |> v.push(%);
    }
  }
  for (i = 0; i < 64; i++) {
    e[v[i]] = i;
  }
  for (i = 0; i < s.length; i += 72) {
    let b = 0,
      c,
      x,
      l = 0,
      o = i |> s.substring(%, i + 72);
    for (x = 0; x < o.length; x++) {
      c = e[x |> o.charAt(%)];
      b = (b << 6) + c;
      l += 6;
      while (l >= 8) {
        r += (b >>> (l -= 8)) % 256 |> w(%);
      }
    }
  }
  return r;
}