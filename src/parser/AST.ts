// ============================================================
// Types
// ============================================================

export type Type =
  | BuiltinType
  | TypeVariable
  | AlgebraicType
  | FunctionType

// Int | Boolean | Unit
export interface BuiltinType {
  kind: "BuiltinType"
  name: "Int" | "Boolean" | "Unit"
}

// typevar
export interface TypeVariable {
  kind: "TypeVariable"
  name: string
}

// algname [< comma_type_nonempty >]
export interface AlgebraicType {
  kind: "AlgebraicType"
  name: string
  typeArgs: Type[]
}

// (comma_type) => type
export interface FunctionType {
  kind: "FunctionType"
  paramTypes: Type[]
  returnType: Type
}

// ============================================================
// Param
// ============================================================

// var : type
export interface Param {
  name: string
  type: Type
}

// ============================================================
// Statements
// ============================================================

export type Statement =
  | ValStatement
  | VarStatement
  | AssignStatement

// val param = exp ;
export interface ValStatement {
  kind: "ValStatement"
  name: string
  type: Type
  value: Expression
}

// var param = exp ;
export interface VarStatement {
  kind: "VarStatement"
  name: string
  type: Type
  value: Expression
}

// var = exp ;
export interface AssignStatement {
  kind: "AssignStatement"
  name: string
  value: Expression
}

// ============================================================
// Patterns
// ============================================================

export type Pattern =
  | VariablePattern
  | WildcardPattern
  | ConstructorPattern

// x — introduces a new variable
export interface VariablePattern {
  kind: "VariablePattern"
  name: string
}

// _
export interface WildcardPattern {
  kind: "WildcardPattern"
}

// consname(comma_pattern)
export interface ConstructorPattern {
  kind: "ConstructorPattern"
  constructorName: string
  args: Pattern[]
}

// case pattern => exp
export interface Case {
  pattern: Pattern
  body: Expression
}

// ============================================================
// Expressions
// ============================================================

export type Expression =
  | IntegerLiteral
  | BooleanLiteral
  | UnitLiteral
  | Identifier
  | BinaryExpression
  | CallExpression
  | PrintlnExpression
  | LambdaExpression
  | BlockExpression
  | MatchExpression

export interface IntegerLiteral {
  kind: "IntegerLiteral"
  value: number
}

export interface BooleanLiteral {
  kind: "BooleanLiteral"
  value: boolean
}

export interface UnitLiteral {
  kind: "UnitLiteral"
}

export interface Identifier {
  kind: "Identifier"
  name: string
}

export interface BinaryExpression {
  kind: "BinaryExpression"
  operator: string
  left: Expression
  right: Expression
}

// primary_exp (type_instantiation? ( comma_exp ))*
export interface CallExpression {
  kind: "CallExpression"
  callee: Expression
  typeArgs: Type[]
  args: Expression[]
}

// println(exp)
export interface PrintlnExpression {
  kind: "PrintlnExpression"
  arg: Expression
}

// (comma_param) => exp
export interface LambdaExpression {
  kind: "LambdaExpression"
  params: Param[]
  body: Expression
}

// { stmt* exp }
export interface BlockExpression {
  kind: "BlockExpression"
  stmts: Statement[]
  expr: Expression
}

// match exp { case+ }
export interface MatchExpression {
  kind: "MatchExpression"
  subject: Expression
  cases: Case[]
}