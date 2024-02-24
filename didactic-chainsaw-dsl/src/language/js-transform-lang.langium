grammar JsTransformLang

entry Model:
    (proposals+=Proposal)*;

Proposal:
    'proposal' name=ID "{"
        "applicable" "to" "{"
            code=RICH_TEXT
        "}"
        "replace" "with" "{"

        "}"
    "}";

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;

terminal fragment IN_RICH_STRING:
      "''" !('«'|"'")
    | "'" !('«'|"'");
//| !('«'|"'");
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
terminal RICH_TEXT: "'''" IN_RICH_STRING* ("'''"| ("'" "'"?)? );
terminal RICH_TEXT_START: "'''" IN_RICH_STRING* ("'" "'"?)? '«';
terminal RICH_TEXT_END: '»' IN_RICH_STRING* ("'''"| ("'" "'"?)? );
terminal RICH_TEXT_INBETWEEN: '»' IN_RICH_STRING* ("'" "'"?)? '«';
terminal COMMENT_RICH_TEXT_INBETWEEN: "««" !('\n'|'\r')* ('\r'? '\n' IN_RICH_STRING* ("'" "'"?)? '«')?;
terminal COMMENT_RICH_TEXT_END: "««" !('\n'|'\r')* (('\r'? '\n' IN_RICH_STRING* ("'''"| ("'" "'"?)? )) );

