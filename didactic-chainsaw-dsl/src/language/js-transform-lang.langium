grammar JsTransformLang


terminal PROPOSALNAME:  /[_a-zA-Z]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
entry Model:
    (proposals+=Proposal);


Proposal:
    "proposal" "(" proposalName=PROPOSALNAME ")" "{"
        "applicable" "to" "{"
            code=STRING
        "}"
        "replace" "with" "{"
            code=STRING
        "}"
    "}";
