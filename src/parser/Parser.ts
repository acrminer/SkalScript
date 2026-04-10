import { Token } from "../lexer/Token"
import { TokenType } from "../lexer/TokenType"
import { Expression } from "./AST"


//the Parser converts tokens into an AST
export class Parser {
  private tokens: Token[]
  private position = 0

  //constructor receives the token list
  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  //peek looks at the current token
  //without moving the position forward
  private peek(): Token {
    return this.tokens[this.position] ?? { type: TokenType.EOF }
  }

  //advance returns the current token
  //and moves the position forward
  private advance(): Token {
    return this.tokens[this.position++] ?? { type: TokenType.EOF }
  }

  //check sees if the current token matches a type
  private check(type: TokenType): boolean {
    return this.peek().type === type
  }

  //match checks for a token type and advances if it matches
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  //consume requires a specific token type
  //otherwise it throws an error
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance()
    }

    throw new Error(message + " Found: " + TokenType[this.peek().type])
  }

  //main parser function for expressions
  parseExpression(): Expression {
    return this.parseEquality()
  }

  //parse == expressions
  private parseEquality(): Expression {
    let left: Expression = this.parseComparison()

    while (this.match(TokenType.DOUBLE_EQUAL)) {
      const operator = "=="
      const right = this.parseComparison()

      left = {
        kind: "BinaryExpression",
        operator,
        left,
        right
      }
    }

    return left
  }

  //parse < and > expressions
  private parseComparison(): Expression {
    let left: Expression = this.parseAdditive()

    while (true) {
      if (this.match(TokenType.LESS)) {
        const operator = "<"
        const right = this.parseAdditive()

        left = {
          kind: "BinaryExpression",
          operator,
          left,
          right
        }
      } else if (this.match(TokenType.GREATER)) {
        const operator = ">"
        const right = this.parseAdditive()

        left = {
          kind: "BinaryExpression",
          operator,
          left,
          right
        }
      } else {
        break
      }
    }

    return left
  }

  //parse + and - expressions
  private parseAdditive(): Expression {
    let left: Expression = this.parseMultiplicative()

    while (true) {
      if (this.match(TokenType.PLUS)) {
        const operator = "+"
        const right = this.parseMultiplicative()

        left = {
          kind: "BinaryExpression",
          operator,
          left,
          right
        }
      } else if (this.match(TokenType.MINUS)) {
        const operator = "-"
        const right = this.parseMultiplicative()

        left = {
          kind: "BinaryExpression",
          operator,
          left,
          right
        }
      } else {
        break
      }
    }

    return left
  }

  //parse * and / expressions
  private parseMultiplicative(): Expression {
    let left: Expression = this.parsePrimary()

    while (true) {
      if (this.match(TokenType.STAR)) {
        const operator = "*"
        const right = this.parsePrimary()

        left = {
          kind: "BinaryExpression",
          operator,
          left,
          right
        }
      } else if (this.match(TokenType.SLASH)) {
        const operator = "/"
        const right = this.parsePrimary()

        left = {
          kind: "BinaryExpression",
          operator,
          left,
          right
        }
      } else {
        break
      }
    }

    return left
  }

  //parse integers, identifiers, booleans, unit, and parenthesized expressions
  private parsePrimary(): Expression {
    const token = this.peek()

    //parse integer literals
    if (this.match(TokenType.INTEGER)) {
      return {
        kind: "IntegerLiteral",
        value: Number(token.value)
      }
    }

    //parse true
    if (this.match(TokenType.TRUE)) {
      return {
        kind: "BooleanLiteral",
        value: true
      }
    }

    //parse false
    if (this.match(TokenType.FALSE)) {
      return {
        kind: "BooleanLiteral",
        value: false
      }
    }

    //parse unit
    if (this.match(TokenType.UNIT)) {
      return {
        kind: "UnitLiteral"
      }
    }

    //parse identifiers
    if (this.match(TokenType.IDENTIFIER)) {
      return {
        kind: "Identifier",
        name: token.value! //the above if case being true and Lexer's readIndentifier should guarantee that value is defined.
      }
    }

    //parse parenthesized expressions
    if (this.match(TokenType.LPAREN)) {
      const expr: Expression = this.parseExpression()
      this.consume(TokenType.RPAREN, "Expected ')' after expression.")
      return expr
    }

    throw new Error("Expected expression. Found: " + TokenType[this.peek().type])
  }
}