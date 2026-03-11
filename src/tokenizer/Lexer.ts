import { Token } from "./Token"
import { TokenType } from "./TokenType"
import { keywords } from "./keywords"

export class Lexer {

  private input: string
  private position = 0

  constructor(input: string) {
    this.input = input
  }

  private peek(): string {
    return this.input[this.position] ?? '\0'
  }

  private advance(): string {
    return this.input[this.position++] ?? '\0'
  }

  private skipWhitespace() {
    while (/\s/.test(this.peek())) {
      this.advance()
    }
  }

  nextToken(): Token {

    this.skipWhitespace()

    const char = this.peek()

    if (char === '\0') {
      return { type: TokenType.EOF }
    }

    if (/[0-9]/.test(char)) {
      return this.readNumber()
    }

    if (/[a-zA-Z]/.test(char)) {
      return this.readIdentifier()
    }

    switch (this.advance()) {

      case '(':
        return { type: TokenType.LPAREN }

      case ')':
        return { type: TokenType.RPAREN }

      case '{':
        return { type: TokenType.LBRACE }

      case '}':
        return { type: TokenType.RBRACE }

      case ',':
        return { type: TokenType.COMMA }

      case ':':
        return { type: TokenType.COLON }

      case ';':
        return { type: TokenType.SEMICOLON }

      case '+':
        return { type: TokenType.PLUS }

      case '-':
        return { type: TokenType.MINUS }

      case '*':
        return { type: TokenType.STAR }

      case '/':
        return { type: TokenType.SLASH }

      case '<':
        return { type: TokenType.LESS }

      case '_':
        return { type: TokenType.UNDERSCORE }

      case '=':

        if (this.peek() === '=') {
          this.advance()
          return { type: TokenType.DOUBLE_EQUAL }
        }

        if (this.peek() === '>') {
          this.advance()
          return { type: TokenType.ARROW }
        }

        return { type: TokenType.EQUAL }

      default:
        throw new Error("Unexpected character: " + char)
    }
  }

  private readNumber(): Token {

    let num = ""

    while (/[0-9]/.test(this.peek())) {
      num += this.advance()
    }

    return {
      type: TokenType.INTEGER,
      value: num
    }
  }

  private readIdentifier(): Token {

    let id = ""

    while (/[a-zA-Z_]/.test(this.peek())) {
      id += this.advance()
    }

    const keyword = keywords[id]

    if (keyword) {
      return { type: keyword }
    }

    return {
      type: TokenType.IDENTIFIER,
      value: id
    }
  }
}