import { Statement, VariableDeclarator } from "@swc/types";
import { MatchStatement } from "../types";

export const from: MatchStatement = {
    type: "VariableDeclaration",
    span: {
        start: 1,
        end: 13,
        ctxt: 0,
    },
    kind: "var",
    declare: false,
    declarations: [
        {
            type: "VariableDeclarator",
            span: {
                start: 5,
                end: 12,
                ctxt: 0,
            },
            id: {
                type: "Identifier",
                span: {
                    start: 5,
                    end: 6,
                    ctxt: 2,
                },
                value: "a",
                optional: false,
            },
            init: {
                type: "NumericLiteral",
                span: {
                    start: 9,
                    end: 12,
                    ctxt: 0,
                },
                value: 100,
                raw: "100",
            },
            definite: false,
        },
    ],
};

export const to: VariableDeclarator[] = [
    {
        type: "VariableDeclarator",
        span: {
            start: 5,
            end: 12,
            ctxt: 0,
        },
        id: {
            type: "Identifier",
            span: {
                start: 5,
                end: 6,
                ctxt: 2,
            },
            value: "a",
            optional: false,
        },
        init: {
            type: "NumericLiteral",
            span: {
                start: 9,
                end: 12,
                ctxt: 0,
            },
            value: 100,
            raw: "100",
        },
        definite: false,
    },
];
