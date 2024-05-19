grammar Jstql

entry Model:
    (proposals+=Proposal)*;

Proposal:
    'proposal' name=ID "{"
        (case+=Case)+
    "}";

Case:
    "case" name=ID "{"
        aplTo=ApplicableTo
        traTo=TraTo
    "}";

ApplicableTo:
    "applicable" "to" "{"
        apl_to_code=STRING
    "}";
TraTo:
    "transform" "to" "{"
        transform_to_code=STRING
    "}";
hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"[^"]*"|'[^']*'/;