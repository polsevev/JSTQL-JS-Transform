import {
    BinaryExpression,
    BlockStatement,
    BreakStatement,
    ClassDeclaration,
    ContinueStatement,
    DebuggerStatement,
    Declaration,
    DoWhileStatement,
    EmptyStatement,
    Expression,
    ExpressionStatement,
    ForInStatement,
    ForOfStatement,
    ForStatement,
    FunctionDeclaration,
    IfStatement,
    LabeledStatement,
    ReturnStatement,
    Script,
    SwitchStatement,
    ThrowStatement,
    TryStatement,
    VariableDeclaration,
    WhileStatement,
    WithStatement,
} from "@swc/core";

export type MatchStatement =
    | MatchBlockSatement
    | MatchEmptyStatement
    | MatchDebuggerStatement
    | MatchWithStatement
    | MatchReturnStatement
    | MatchLabeledStatement
    | MatchBreakStatement
    | MatchContinueStatement
    | matchIfStatement
    | MatchSwitchStatement
    | MatchThrowStatement
    | MatchTryStatement
    | MatchWhileStatement
    | MatchDoWhileStatement
    | MatchForInStatement
    | MatchForStatement
    | MatchForOfStatement
    | MatchDeclaration
    | MatchExpressionStatement;

type MatchDeclaration =
    | MatchClassDeclaration
    | MatchFunctionDeclaration
    | MatchVariableDeclaration;

export enum Transformation {
    ANYTHING,
}

export interface MatchScript extends Script {}

export interface MatchBlockSatement extends BlockStatement {}

export interface MatchEmptyStatement extends EmptyStatement {}

export interface MatchDebuggerStatement extends DebuggerStatement {}

export interface MatchWithStatement extends WithStatement {}

export interface MatchReturnStatement extends ReturnStatement {}

export interface MatchLabeledStatement extends LabeledStatement {}

export interface MatchBreakStatement extends BreakStatement {}

export interface MatchContinueStatement extends ContinueStatement {}

export interface MatchSwitchStatement extends SwitchStatement {}

export interface MatchThrowStatement extends ThrowStatement {}

export interface MatchTryStatement extends TryStatement {}

export interface MatchWhileStatement extends WhileStatement {}

export interface MatchDoWhileStatement extends DoWhileStatement {}

export interface MatchForStatement extends ForStatement {}

export interface MatchForInStatement extends ForInStatement {}

export interface MatchForOfStatement extends ForOfStatement {}

export interface MatchExpressionStatement extends ExpressionStatement {}

export interface matchIfStatement extends IfStatement {}

export interface matchBinaryExpression extends BlockStatement {
    __stmts: Transformation;
}

export interface MatchClassDeclaration extends ClassDeclaration {}

export interface MatchFunctionDeclaration extends FunctionDeclaration {}

export interface MatchVariableDeclaration extends VariableDeclaration {}
