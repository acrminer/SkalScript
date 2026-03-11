import { TokenType } from "./TokenType"

export const keywords: Record<string, TokenType> = {
  val: TokenType.VAL,
  var: TokenType.VAR,
  def: TokenType.DEF,
  algdef: TokenType.ALGDEF,
  match: TokenType.MATCH,
  case: TokenType.CASE,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  unit: TokenType.UNIT,
  println: TokenType.PRINTLN,

  Int: TokenType.INT,
  Boolean: TokenType.BOOLEAN,
  Unit: TokenType.UNIT_TYPE
}

//LETS LEXER DISTINGUISH BETWEEN MAP -> IDENTIFIER, val -> VAL

