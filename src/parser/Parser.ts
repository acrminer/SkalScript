import { Token } from "../lexer/Token"
import { TokenType } from "../lexer/TokenType"
import { Expression, Type, Param } from "./AST"


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

  //parse == expressions (at most one ==)
  private parseEquality(): Expression {
    const left: Expression = this.parseComparison()

    if (this.match(TokenType.DOUBLE_EQUAL)) {
      const right = this.parseComparison()
      return {
        kind: "BinaryExpression",
        operator: "==",
        left,
        right
      }
    }

    return left
  }

  //parse < and > expressions (at most one < or >)
  private parseComparison(): Expression {
    const left: Expression = this.parseAdditive()

    if (this.match(TokenType.LESS)) {
      const right = this.parseAdditive()
      return {
        kind: "BinaryExpression",
        operator: "<",
        left,
        right
      }
    }

    if (this.match(TokenType.GREATER)) {
      const right = this.parseAdditive()
      return {
        kind: "BinaryExpression",
        operator: ">",
        left,
        right
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
    let left: Expression = this.parseCall()

    while (true) {
      if (this.match(TokenType.STAR)) {
        const operator = "*"
        const right = this.parseCall()

        left = {
          kind: "BinaryExpression",
          operator,
          left,
          right
        }
      } else if (this.match(TokenType.SLASH)) {
        const operator = "/"
        const right = this.parseCall()

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

  //scan ahead to check if < is clearly the start of <...>(...)
  //does not consume any tokens or change parser state
  private looksLikeTypeInstantiation(): boolean {
    let i = this.position + 1   // start just after <
    let depth = 1
    while (i < this.tokens.length) {
      if (this.tokens[i].type === TokenType.LESS) depth++
      else if (this.tokens[i].type === TokenType.GREATER) {
        depth--
        if (depth === 0) {
          return i + 1 < this.tokens.length &&
                 this.tokens[i + 1].type === TokenType.LPAREN
        }
      }
      i++
    }
    return false
  }

  //parse comma-separated expression arguments
  private parseArgs(): Expression[] {
    const args: Expression[] = []
    if (!this.check(TokenType.RPAREN)) {
      args.push(this.parseExpression())
      while (this.match(TokenType.COMMA)) {
        args.push(this.parseExpression())
      }
    }
    return args
  }

  //call_exp ::= primary_exp (type_instantiation ( comma_exp ))*
  private parseCall(): Expression {
    let callee: Expression = this.parsePrimary()

    while (true) {
      if (this.check(TokenType.LESS) && this.looksLikeTypeInstantiation()) {
        this.advance()  // consume <
        const typeArgs: Type[] = [this.parseType()]
        while (this.match(TokenType.COMMA)) {
          typeArgs.push(this.parseType())
        }
        this.consume(TokenType.GREATER, "Expected '>' after type arguments.")
        this.consume(TokenType.LPAREN, "Expected '(' after type arguments.")
        const args = this.parseArgs()
        this.consume(TokenType.RPAREN, "Expected ')' after arguments.")
        callee = { kind: "CallExpression", callee, typeArgs, args }
      } else if (this.match(TokenType.LPAREN)) {
        const args = this.parseArgs()
        this.consume(TokenType.RPAREN, "Expected ')' after arguments.")
        callee = { kind: "CallExpression", callee, typeArgs: [], args }
      } else {
        break
      }
    }

    return callee
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

  // type ::= `Int` | `Boolean` | `Unit`
  //        | typevar
  //        | algname type_instantiation
  //        | `(` comma_type `)` (`=>` type)*
  parseType(): Type {

    // built-in types
    if (this.match(TokenType.INT))     return { kind: "BuiltinType", name: "Int" }
    if (this.match(TokenType.BOOLEAN)) return { kind: "BuiltinType", name: "Boolean" }
    if (this.match(TokenType.UNIT_TYPE)) return { kind: "BuiltinType", name: "Unit" }

    // typevar or algname type_instantiation
    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value!

      // type_instantiation: `<` comma_type_nonempty `>`
      if (this.match(TokenType.LESS)) {
        const typeArgs: Type[] = [this.parseType()]
        while (this.match(TokenType.COMMA)) {
          typeArgs.push(this.parseType())
        }
        this.consume(TokenType.GREATER, "Expected '>' after type arguments.")
        return { kind: "AlgebraicType", name, typeArgs }
      }

      return { kind: "TypeVariable", name }
    }

    // `(` comma_type `)` (`=>` type)*
    if (this.match(TokenType.LPAREN)) {
      const paramTypes: Type[] = []

      // comma_type: zero or more types
      if (!this.check(TokenType.RPAREN)) {
        paramTypes.push(this.parseType())
        while (this.match(TokenType.COMMA)) {
          paramTypes.push(this.parseType())
        }
      }
      this.consume(TokenType.RPAREN, "Expected ')' after types.")

      // function type: `=>` type
      if (this.match(TokenType.ARROW)) {
        return {
          kind: "FunctionType",
          paramTypes,
          returnType: this.parseType()
        }
      }

      // parenthesized type: must be exactly one type
      if (paramTypes.length === 1) return paramTypes[0]

      throw new Error("Expected '=>' after multiple types in parentheses.")
    }

    throw new Error("Expected type. Found: " + TokenType[this.peek().type])
  }

  // param ::= var `:` type
  parseParam(): Param {
    const name = this.consume(TokenType.IDENTIFIER, "Expected parameter name.").value!
    this.consume(TokenType.COLON, "Expected ':' after parameter name.")
    const type = this.parseType()
    return { name, type }
  }
}