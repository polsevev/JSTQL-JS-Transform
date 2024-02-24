grammar JsTransformLang


terminal ID:  /[_a-zA-Z][\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
entry Model:
    proposals+=Proposal*;


Proposal:
    "proposal" proposalName=ID "{"
        "applicable" "to" "{"
            code=STRING
        "}"
        "replace" "with" "{"
            code=STRING
        "}"
    "}";
