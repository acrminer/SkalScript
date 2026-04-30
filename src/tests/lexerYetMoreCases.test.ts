import { Lexer } from "../lexer/Lexer";
import { tokenize } from "../lexer/tokenize";
import { TokenType } from "../lexer/TokenType";

function tokenTypes(input: string): TokenType[] {
  return tokenize(input).map(t => t.type);
}

// tokenize() helper end-to-end

test("tokenize on empty input returns just EOF", () => {
  const tokens = tokenize("");
  expect(tokens).toHaveLength(1);
  expect(tokens[0].type).toBe(TokenType.EOF);
});

test("tokenize on a small program returns the full token array", () => {
  const tokens = tokenize("val x: Int = 1;");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.VAL,
    TokenType.IDENTIFIER,
    TokenType.COLON,
    TokenType.INT,
    TokenType.EQUAL,
    TokenType.INTEGER,
    TokenType.SEMICOLON,
    TokenType.EOF
  ]);
  expect(tokens[1].value).toBe("x");
  expect(tokens[5].value).toBe("1");
});

// nextToken() past EOF keeps returning EOF

test("nextToken past EOF keeps returning EOF", () => {
  const lexer = new Lexer("");
  expect(lexer.nextToken().type).toBe(TokenType.EOF);
  expect(lexer.nextToken().type).toBe(TokenType.EOF);
  expect(lexer.nextToken().type).toBe(TokenType.EOF);
});

test("nextToken past EOF after consuming a token still returns EOF", () => {
  const lexer = new Lexer("x");
  expect(lexer.nextToken().type).toBe(TokenType.IDENTIFIER);
  expect(lexer.nextToken().type).toBe(TokenType.EOF);
  expect(lexer.nextToken().type).toBe(TokenType.EOF);
});

// generic type instantiation

test("List<A> tokenizes as IDENTIFIER LESS IDENTIFIER GREATER", () => {
  expect(tokenTypes("List<A>")).toEqual([
    TokenType.IDENTIFIER,
    TokenType.LESS,
    TokenType.IDENTIFIER,
    TokenType.GREATER,
    TokenType.EOF
  ]);
});

test("Cons<Int>(1, Nil<Int>()) tokenizes correctly", () => {
  expect(tokenTypes("Cons<Int>(1, Nil<Int>())")).toEqual([
    TokenType.IDENTIFIER,
    TokenType.LESS,
    TokenType.INT,
    TokenType.GREATER,
    TokenType.LPAREN,
    TokenType.INTEGER,
    TokenType.COMMA,
    TokenType.IDENTIFIER,
    TokenType.LESS,
    TokenType.INT,
    TokenType.GREATER,
    TokenType.LPAREN,
    TokenType.RPAREN,
    TokenType.RPAREN,
    TokenType.EOF
  ]);
});

// multi-char operators require adjacency

test("= = with whitespace is two EQUAL tokens, not DOUBLE_EQUAL", () => {
  expect(tokenTypes("= =")).toEqual([
    TokenType.EQUAL,
    TokenType.EQUAL,
    TokenType.EOF
  ]);
});

test("= > with whitespace is EQUAL and GREATER, not ARROW", () => {
  expect(tokenTypes("= >")).toEqual([
    TokenType.EQUAL,
    TokenType.GREATER,
    TokenType.EOF
  ]);
});

// operator precedence inside the = branch

test("==> tokenizes as DOUBLE_EQUAL then GREATER", () => {
  expect(tokenTypes("==>")).toEqual([
    TokenType.DOUBLE_EQUAL,
    TokenType.GREATER,
    TokenType.EOF
  ]);
});

test("=== tokenizes as DOUBLE_EQUAL then EQUAL", () => {
  expect(tokenTypes("===")).toEqual([
    TokenType.DOUBLE_EQUAL,
    TokenType.EQUAL,
    TokenType.EOF
  ]);
});

// leading-underscore identifier

test("_foo tokenizes as UNDERSCORE then IDENTIFIER", () => {
  const tokens = tokenize("_foo");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.UNDERSCORE,
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
  expect(tokens[1].value).toBe("foo");
});

// keyword-prefix identifiers stay identifiers

test("valid is an IDENTIFIER, not VAL plus id", () => {
  const tokens = tokenize("valid");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
  expect(tokens[0].value).toBe("valid");
});

test("defining is an IDENTIFIER, not DEF plus id", () => {
  const tokens = tokenize("defining");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
  expect(tokens[0].value).toBe("defining");
});

test("Integer is an IDENTIFIER, not INT plus id", () => {
  const tokens = tokenize("Integer");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
  expect(tokens[0].value).toBe("Integer");
});

test("truely is an IDENTIFIER, not TRUE plus id", () => {
  const tokens = tokenize("truely");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
  expect(tokens[0].value).toBe("truely");
});

// embedded digits and underscores in identifiers

test("x1y2 is a single IDENTIFIER with full value preserved", () => {
  const tokens = tokenize("x1y2");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
  expect(tokens[0].value).toBe("x1y2");
});

test("trailing underscore is part of the identifier", () => {
  const tokens = tokenize("foo_");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
  expect(tokens[0].value).toBe("foo_");
});

// tabs and carriage returns are skipped as whitespace

test("tab is treated as whitespace", () => {
  expect(tokenTypes("\tx\t+\t1")).toEqual([
    TokenType.IDENTIFIER,
    TokenType.PLUS,
    TokenType.INTEGER,
    TokenType.EOF
  ]);
});

test("carriage return is treated as whitespace", () => {
  expect(tokenTypes("x\r\n+\r1")).toEqual([
    TokenType.IDENTIFIER,
    TokenType.PLUS,
    TokenType.INTEGER,
    TokenType.EOF
  ]);
});

test("mixed tabs, spaces, newlines, and carriage returns all skip", () => {
  expect(tokenTypes("\t \r\n  x\t\r\n  ")).toEqual([
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
});

// value is undefined on non-INTEGER/IDENTIFIER tokens

test("operator and punctuation tokens have no value field set", () => {
  const tokens = tokenize("+ - * / < > = == => ( ) { } , : ; _");
  for (const token of tokens) {
    if (token.type !== TokenType.EOF) {
      expect(token.value).toBeUndefined();
    }
  }
});

test("keyword tokens have no value field set", () => {
  const tokens = tokenize("val var def algdef match case true false unit println Int Boolean Unit");
  for (const token of tokens) {
    if (token.type !== TokenType.EOF) {
      expect(token.value).toBeUndefined();
    }
  }
});

test("EOF token has no value field set", () => {
  const tokens = tokenize("");
  expect(tokens[0].type).toBe(TokenType.EOF);
  expect(tokens[0].value).toBeUndefined();
});

// negative-looking literal is two tokens, since the spec has no negative literal

test("-5 tokenizes as MINUS then INTEGER", () => {
  const tokens = tokenize("-5");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.MINUS,
    TokenType.INTEGER,
    TokenType.EOF
  ]);
  expect(tokens[1].value).toBe("5");
});

test("x - 5 tokenizes the same way as a subtraction expression", () => {
  const tokens = tokenize("x - 5");
  expect(tokens.map(t => t.type)).toEqual([
    TokenType.IDENTIFIER,
    TokenType.MINUS,
    TokenType.INTEGER,
    TokenType.EOF
  ]);
});

// spec says no comments, so // and /* must lex as separate operator tokens

test("// tokenizes as two SLASH tokens, not a comment", () => {
  expect(tokenTypes("//")).toEqual([
    TokenType.SLASH,
    TokenType.SLASH,
    TokenType.EOF
  ]);
});

test("/* tokenizes as SLASH then STAR, not a comment opener", () => {
  expect(tokenTypes("/*")).toEqual([
    TokenType.SLASH,
    TokenType.STAR,
    TokenType.EOF
  ]);
});

test("// followed by code is not consumed as a comment", () => {
  expect(tokenTypes("// x")).toEqual([
    TokenType.SLASH,
    TokenType.SLASH,
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
});

// unexpected characters beyond @ all throw

const unexpectedChars = ["#", "$", "?", ".", "!", "&", "|", "^", "\"", "'", "[", "]", "~", "\\"];

test.each(unexpectedChars)("unexpected character %s throws", (ch) => {
  expect(() => new Lexer(ch).nextToken()).toThrow("Unexpected character: " + ch);
});

test("unexpected character throws even when surrounded by valid tokens", () => {
  const lexer = new Lexer("x # y");
  expect(lexer.nextToken().type).toBe(TokenType.IDENTIFIER);
  expect(() => lexer.nextToken()).toThrow("Unexpected character: #");
});
