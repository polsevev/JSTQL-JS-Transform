function parse() {
    const input = document.getElementById("input").value;
    const data = input.slice(32);

    const compressedData = decode_base64(data);
    const uncompressed = pako.inflate(compressedData, { to: "string" });
    const json = JSON.parse(uncompressed);
    console.log(json);

    convertToDesktop(json);
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
        lastBonusRewardCheckTimestamp: 0,
    };

    const mappedValues = {
        rubies: Math.round(json.rubies / 10),
    };

    const pcSpecificValues = {
        readPatchNumber: "1.0e12",
        saveOrigin: "pc",
    };

    const hash = "7a990d405d2c6fb93aa8fbb0ec1a3b23";
    const newData = {
        ...newValues,
        ...json,
        ...mappedValues,
        ...pcSpecificValues,
    };
    const compressed = pako.deflate(JSON.stringify(newData), { to: "string" });
    const base64 = btoa(compressed);

    const finalSaveString = hash + base64;
    document.getElementById("output_output").innerText = finalSaveString;
    showOutput();
}

function showOutput() {
    document.getElementById("outputs").style.visibility = "visible";
}

function copyOutput() {
    const output = document.getElementById("output_output");
    output.disabled = false;
    output.focus();
    output.select();
    document.execCommand("copy");
    output.disabled = true;
    const successElement = document.getElementById("copy_success_msg");
    successElement.style.visibility = "visible";
    setTimeout(() => (successElement.style.visibility = "hidden"), 4000);
}

function decode_base64(s) {
    let e = {},
        i,
        k,
        v = [],
        r = "",
        w = String.fromCharCode;
    let n = [
        [65, 91],
        [97, 123],
        [48, 58],
        [43, 44],
        [47, 48],
    ];

    for (z in n) {
        for (i = n[z][0]; i < n[z][1]; i++) {
            v.push(w(i));
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
            o = s.substring(i, i + 72);
        for (x = 0; x < o.length; x++) {
            c = e[o.charAt(x)];
            b = (b << 6) + c;
            l += 6;
            while (l >= 8) {
                r += w((b >>> (l -= 8)) % 256);
            }
        }
    }
    return r;
}
