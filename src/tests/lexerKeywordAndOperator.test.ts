import { Lexer } from "../lexer/Lexer";
import { TokenType } from "../lexer/TokenType";

function nextToken(input: string) {
  return new Lexer(input).nextToken();
}

function tokenTypes(input: string): TokenType[] {
  const lexer = new Lexer(input);
  const types: TokenType[] = [];
  let token;
  do {
    token = lexer.nextToken();
    types.push(token.type);
  } while (token.type !== TokenType.EOF);
  return types;
}

//missing keyword coverage

test("unit keyword produces UNIT token", () => {
  expect(nextToken("unit").type).toBe(TokenType.UNIT);
});

test("algdef keyword produces ALGDEF token", () => {
  expect(nextToken("algdef").type).toBe(TokenType.ALGDEF);
});

// unit (keyword) vs Unit (type) are distinct tokens
test("unit and Unit are different tokens", () => {
  expect(nextToken("unit").type).toBe(TokenType.UNIT);
  expect(nextToken("Unit").type).toBe(TokenType.UNIT_TYPE);
});

//greater-than operator

test("greater-than token", () => {
  expect(nextToken(">").type).toBe(TokenType.GREATER);
});

// => is a single ARROW token
test("=> lexes as ARROW", () => {
  expect(tokenTypes("=>")).toEqual([TokenType.ARROW, TokenType.EOF]);
});

//identifier and integer value preservation

test("IDENTIFIER token preserves its name", () => {
  const token = nextToken("myVar");
  expect(token.type).toBe(TokenType.IDENTIFIER);
  expect(token.value).toBe("myVar");
});

test("INTEGER token preserves zero", () => {
  const token = nextToken("0");
  expect(token.type).toBe(TokenType.INTEGER);
  expect(token.value).toBe("0");
});

//representative token sequences
//var declaration with Boolean type
test("var declaration tokenizes correctly", () => {
  expect(tokenTypes("var flag: Boolean = true;")).toEqual([
    TokenType.VAR,
    TokenType.IDENTIFIER,
    TokenType.COLON,
    TokenType.BOOLEAN,
    TokenType.EQUAL,
    TokenType.TRUE,
    TokenType.SEMICOLON,
    TokenType.EOF
  ]);
});

//expression using the > operator
test("greater-than expression tokenizes correctly", () => {
  expect(tokenTypes("x > 0")).toEqual([
    TokenType.IDENTIFIER,
    TokenType.GREATER,
    TokenType.INTEGER,
    TokenType.EOF
  ]);
});

//match/case keywords appear together in the language
test("match and case keywords tokenize correctly", () => {
  expect(tokenTypes("match case")).toEqual([
    TokenType.MATCH,
    TokenType.CASE,
    TokenType.EOF
  ]);
});