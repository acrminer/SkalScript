
import { Lexer } from "../lexer/Lexer"
import { TokenType } from "../lexer/TokenType"


//helper function that runs the lexer on a string
//and collects all token types until EOF
function getTokens(input: string): TokenType[] {

  //ceate a new lexer with the input string
  const lexer = new Lexer(input)

  //array to store all token types returned by the lexer
  const tokens: TokenType[] = []

  let token

  //keep asking the lexer for the next token
  //until the End Of File token is reached
  do {
    token = lexer.nextToken()
    tokens.push(token.type)
  } while (token.type !== TokenType.EOF)

  return tokens
}


//test that a letter is recognized as an IDENTIFIER
test("identifier token", () => {
  const tokens = getTokens("x")
  expect(tokens).toContain(TokenType.IDENTIFIER)
})


//test that numbers are recognized as INTEGER tokens
test("integer token", () => {
  const tokens = getTokens("123")
  expect(tokens).toContain(TokenType.INTEGER)
})


//test that the '+' symbol is recognized
test("plus token", () => {
  const tokens = getTokens("+")
  expect(tokens).toContain(TokenType.PLUS)
})


//test that the '-' symbol is recognized
test("minus token", () => {
  const tokens = getTokens("-")
  expect(tokens).toContain(TokenType.MINUS)
})


//test parentheses tokens
test("parentheses tokens", () => {
  const tokens = getTokens("( )")
  expect(tokens).toContain(TokenType.LPAREN)
  expect(tokens).toContain(TokenType.RPAREN)
})


//test semicolon token
test("semicolon token", () => {
  const tokens = getTokens(";")
  expect(tokens).toContain(TokenType.SEMICOLON)
})


//test assignment operator =
test("equals token", () => {
  const tokens = getTokens("=")
  expect(tokens).toContain(TokenType.EQUAL)
})


//test comparison operator ==
test("double equals token", () => {
  const tokens = getTokens("==")
  expect(tokens).toContain(TokenType.DOUBLE_EQUAL)
})


//test arrow operator =>
test("arrow token", () => {
  const tokens = getTokens("=>")
  expect(tokens).toContain(TokenType.ARROW)
})


//test that keywords are NOT treated as identifiers
test("keyword token", () => {
  const tokens = getTokens("val")
  expect(tokens).not.toContain(TokenType.IDENTIFIER)

})
//test multiplication token
test("multiply token", () => {
  const tokens = getTokens("*")
  expect(tokens).toContain(TokenType.STAR)
})


//test division token
test("division token", () => {
  const tokens = getTokens("/")
  expect(tokens).toContain(TokenType.SLASH)
})


//test less-than token
test("less than token", () => {
  const tokens = getTokens("<")
  expect(tokens).toContain(TokenType.LESS)
})


//test greater-than token
test("greater than token", () => {
  const tokens = getTokens(">")
  expect(tokens).toContain(TokenType.GREATER)
})


//test multiple identifiers
test("multiple identifiers", () => {
  const tokens = getTokens("x y z")
  expect(tokens.filter(t => t === TokenType.IDENTIFIER).length).toBe(3)
})


//test whitespace handling
test("ignores whitespace", () => {
  const tokens = getTokens("   123   ")
  expect(tokens).toContain(TokenType.INTEGER)
})


//test mixed expression
test("mixed expression tokens", () => {
  const tokens = getTokens("x + 5")

  expect(tokens).toContain(TokenType.IDENTIFIER)
  expect(tokens).toContain(TokenType.PLUS)
  expect(tokens).toContain(TokenType.INTEGER)
})


//test boolean keyword
test("boolean keyword token", () => {
  const tokens = getTokens("true")
  expect(tokens).not.toContain(TokenType.IDENTIFIER)
})


//test EOF token always exists
test("includes EOF token", () => {
  const tokens = getTokens("x")
  expect(tokens[tokens.length - 1]).toBe(TokenType.EOF)
})


//This file tests the main functionality of the lexer by 
//providing simple input strings and checking that the correct token
//types are produced. It verifies that identifiers, integers, operators, 
//and punctuation symbols are correctly recognized by the lexer.