import { Token } from "../lexer/Token"
import { TokenType } from "../lexer/TokenType"
import { Expression, Type, Param, Statement, Case, Pattern, AlgDef, ConstructorDef, FuncDef, Program } from "./AST"


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

  //program ::= algdef* funcdef* exp
  parseProgram(): Program {
    const algDefs: AlgDef[] = []
    while (this.check(TokenType.ALGDEF)) {
      algDefs.push(this.parseAlgDef())
    }

    const funcDefs: FuncDef[] = []
    while (this.check(TokenType.DEF)) {
      funcDefs.push(this.parseFuncDef())
    }

    const expr = this.parseExpression()
    this.consume(TokenType.EOF, "Expected end of program.")

    return { kind: "Program", algDefs, funcDefs, expr }
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
    let left: Expression = this.parseAdditive()

    while (true) {
    if (this.match(TokenType.LESS)) {
      const right = this.parseAdditive()
      left = {
        kind: "BinaryExpression",
        operator: "<",
        left,
        right
      }
    }

    else if (this.match(TokenType.GREATER)) {
      const right = this.parseAdditive()
      left = {
        kind: "BinaryExpression",
        operator: ">",
        left,
        right
      }
    }
    else {
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

  //called after ( is consumed: checks if this looks like a lambda
  //() => exp: current token is ), next is =>
  //(param, ...) => exp: current token is IDENTIFIER, next is :
  private looksLikeLambda(): boolean {
    if (this.check(TokenType.RPAREN)) {
      return this.position + 1 < this.tokens.length &&
             this.tokens[this.position + 1].type === TokenType.ARROW
    }
    return this.check(TokenType.IDENTIFIER) &&
           this.position + 1 < this.tokens.length &&
           this.tokens[this.position + 1].type === TokenType.COLON
  }

  //checks if the current token starts a statement
  private isStatementStart(): boolean {
    if (this.check(TokenType.VAL) || this.check(TokenType.VAR)) return true
    //assignment: IDENTIFIER followed by = (not ==)
    return this.check(TokenType.IDENTIFIER) &&
           this.position + 1 < this.tokens.length &&
           this.tokens[this.position + 1].type === TokenType.EQUAL
  }

  //stmt ::= `val` param `=` exp `;`
  //       | `var` param `=` exp `;`
  //       | var `=` exp `;`
  private parseStatement(): Statement {

    //val param = exp ;
    if (this.match(TokenType.VAL)) {
      const name = this.consume(TokenType.IDENTIFIER, "Expected variable name after 'val'.").value!
      this.consume(TokenType.COLON, "Expected ':' after variable name.")
      const type = this.parseType()
      this.consume(TokenType.EQUAL, "Expected '=' after type.")
      const value = this.parseExpression()
      this.consume(TokenType.SEMICOLON, "Expected ';' after val declaration.")
      return { kind: "ValStatement", name, type, value }
    }

    //var param = exp ;
    if (this.match(TokenType.VAR)) {
      const name = this.consume(TokenType.IDENTIFIER, "Expected variable name after 'var'.").value!
      this.consume(TokenType.COLON, "Expected ':' after variable name.")
      const type = this.parseType()
      this.consume(TokenType.EQUAL, "Expected '=' after type.")
      const value = this.parseExpression()
      this.consume(TokenType.SEMICOLON, "Expected ';' after var declaration.")
      return { kind: "VarStatement", name, type, value }
    }

    //var = exp ;  (assignment to mutable variable)
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name.").value!
    this.consume(TokenType.EQUAL, "Expected '=' after variable name.")
    const value = this.parseExpression()
    this.consume(TokenType.SEMICOLON, "Expected ';' after assignment.")
    return { kind: "AssignStatement", name, value }
  }

  //case ::= `case` pattern `=>` exp
  private parseCase(): Case {
    this.consume(TokenType.CASE, "Expected 'case'.")
    const pattern = this.parsePattern()
    this.consume(TokenType.ARROW, "Expected '=>' after pattern.")
    const body = this.parseExpression()
    return { pattern, body }
  }

  //pattern ::= x 
  // | `_` 
  // | consname `(` comma_pattern `)`
  private parsePattern(): Pattern {

    //_
    if (this.match(TokenType.UNDERSCORE)) {
      return { kind: "WildcardPattern" }
    }

    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value!

      //consname(comma_pattern)
      if (this.match(TokenType.LPAREN)) {
        const args: Pattern[] = []
        if (!this.check(TokenType.RPAREN)) {
          args.push(this.parsePattern())
          while (this.match(TokenType.COMMA)) {
            args.push(this.parsePattern())
          }
        }
        this.consume(TokenType.RPAREN, "Expected ')' after constructor patterns.")
        return { kind: "ConstructorPattern", constructorName: name, args }
      }

      //variable pattern
      return { kind: "VariablePattern", name }
    }

    throw new Error("Expected pattern. Found: " + TokenType[this.peek().type])
  }

  //parse integers, identifiers, booleans, unit, and all primary expressions
  private parsePrimary(): Expression {
    const token = this.peek()

    //parse integer literals
    if (this.match(TokenType.INTEGER)) {
      return { kind: "IntegerLiteral", value: Number(token.value) }
    }

    //parse true
    if (this.match(TokenType.TRUE)) {
      return { kind: "BooleanLiteral", value: true }
    }

    //parse false
    if (this.match(TokenType.FALSE)) {
      return { kind: "BooleanLiteral", value: false }
    }

    //parse unit
    if (this.match(TokenType.UNIT)) {
      return { kind: "UnitLiteral" }
    }

    //parse identifiers
    if (this.match(TokenType.IDENTIFIER)) {
      return {
        kind: "Identifier",
        name: token.value! //the above if case being true and Lexer's readIndentifier should guarantee that value is defined.
      }
    }

    //println(exp)
    if (this.match(TokenType.PRINTLN)) {
      this.consume(TokenType.LPAREN, "Expected '(' after 'println'.")
      const arg = this.parseExpression()
      this.consume(TokenType.RPAREN, "Expected ')' after println argument.")
      return { kind: "PrintlnExpression", arg }
    }

    //(comma_param) => exp  OR  (exp)
    if (this.match(TokenType.LPAREN)) {
      if (this.looksLikeLambda()) {
        const params: Param[] = []
        if (!this.check(TokenType.RPAREN)) {
          params.push(this.parseParam())
          while (this.match(TokenType.COMMA)) {
            params.push(this.parseParam())
          }
        }
        this.consume(TokenType.RPAREN, "Expected ')' after parameters.")
        this.consume(TokenType.ARROW, "Expected '=>' after parameters.")
        const body = this.parseExpression()
        return { kind: "LambdaExpression", params, body }
      }
      //parenthesized expression
      const expr: Expression = this.parseExpression()
      this.consume(TokenType.RPAREN, "Expected ')' after expression.")
      return expr
    }

    //{ stmt* exp }
    if (this.match(TokenType.LBRACE)) {
      const stmts: Statement[] = []
      while (!this.check(TokenType.RBRACE) && !this.check(TokenType.EOF)) {
        if (this.isStatementStart()) {
          stmts.push(this.parseStatement())
        } else {
          break
        }
      }
      const expr = this.parseExpression()
      this.consume(TokenType.RBRACE, "Expected '}' after block.")
      return { kind: "BlockExpression", stmts, expr }
    }

    //match exp { case+ }
    if (this.match(TokenType.MATCH)) {
      const subject = this.parseExpression()
      this.consume(TokenType.LBRACE, "Expected '{' after match expression.")
      const firstCase = this.parseCase()
      const restCases: Case[] = []
      while (this.check(TokenType.CASE)) {
        restCases.push(this.parseCase())
      }
      this.consume(TokenType.RBRACE, "Expected '}' after match cases.")
      return { kind: "MatchExpression", subject, cases: [firstCase, ...restCases] }
    }

    throw new Error("Expected expression. Found: " + TokenType[this.peek().type])
  }

  // funcdef ::= `def` fn [`<` comma_typevar `>`] `(` comma_param `)` `:` type `=` exp `;`
  parseFuncDef(): FuncDef {
    this.consume(TokenType.DEF, "Expected 'def'.")
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name.").value!

    // optional type parameters: [< comma_typevar >]
    const typeParams: string[] = []
    if (this.match(TokenType.LESS)) {
      typeParams.push(this.consume(TokenType.IDENTIFIER, "Expected type variable.").value!)
      while (this.match(TokenType.COMMA)) {
        typeParams.push(this.consume(TokenType.IDENTIFIER, "Expected type variable.").value!)
      }
      this.consume(TokenType.GREATER, "Expected '>' after type parameters.")
    }

    // (comma_param)
    this.consume(TokenType.LPAREN, "Expected '(' after function name.")
    const params: Param[] = []
    if (!this.check(TokenType.RPAREN)) {
      params.push(this.parseParam())
      while (this.match(TokenType.COMMA)) {
        params.push(this.parseParam())
      }
    }
    this.consume(TokenType.RPAREN, "Expected ')' after parameters.")

    // : type
    this.consume(TokenType.COLON, "Expected ':' after parameters.")
    const returnType = this.parseType()

    // = exp ;
    this.consume(TokenType.EQUAL, "Expected '=' after return type.")
    const body = this.parseExpression()
    this.consume(TokenType.SEMICOLON, "Expected ';' after function body.")

    return { kind: "FuncDef", name, typeParams, params, returnType, body }
  }

  // consdef ::= consname `(` comma_type `)`
  private parseConstructorDef(): ConstructorDef {
    const name = this.consume(TokenType.IDENTIFIER, "Expected constructor name.").value!
    this.consume(TokenType.LPAREN, "Expected '(' after constructor name.")
    const params: Type[] = []
    if (!this.check(TokenType.RPAREN)) {
      params.push(this.parseType())
      while (this.match(TokenType.COMMA)) {
        params.push(this.parseType())
      }
    }
    this.consume(TokenType.RPAREN, "Expected ')' after constructor types.")
    return { name, params }
  }

  // algdef ::= `algdef` algname [`<` comma_typevar `>`] `{` comma_consdef `}`
  parseAlgDef(): AlgDef {
    this.consume(TokenType.ALGDEF, "Expected 'algdef'.")
    const name = this.consume(TokenType.IDENTIFIER, "Expected algebraic type name.").value!

    // optional type parameters: [< comma_typevar >]
    const typeParams: string[] = []
    if (this.match(TokenType.LESS)) {
      typeParams.push(this.consume(TokenType.IDENTIFIER, "Expected type variable.").value!)
      while (this.match(TokenType.COMMA)) {
        typeParams.push(this.consume(TokenType.IDENTIFIER, "Expected type variable.").value!)
      }
      this.consume(TokenType.GREATER, "Expected '>' after type parameters.")
    }

    this.consume(TokenType.LBRACE, "Expected '{' after algdef name.")

    // comma_consdef: at least one constructor, comma-separated
    const firstConstructor = this.parseConstructorDef()
    const restConstructors: ConstructorDef[] = []
    while (this.match(TokenType.COMMA)) {
      restConstructors.push(this.parseConstructorDef())
    }

    this.consume(TokenType.RBRACE, "Expected '}' after constructors.")

    return {
      kind: "AlgDef",
      name,
      typeParams,
      constructors: [firstConstructor, ...restConstructors]
    }
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
