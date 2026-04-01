import { Lexer } from "../tokenizer/Lexer";
import { TokenType } from "../tokenizer/TokenType";

//helper
function tokenize(input: string) {
  const lexer = new Lexer(input);
  const tokens: { type: TokenType; value?: string }[] = [];

  let token;
  do {
    token = lexer.nextToken();
    tokens.push(token);
  } while (token.type !== TokenType.EOF);

  return tokens;
}

test("variable declaration", () => {
  const tokens = tokenize("val foo: Int = 42;");

  const types = tokens.map(t => t.type);

  expect(types).toEqual([
    TokenType.VAL,
    TokenType.IDENTIFIER,
    TokenType.COLON,
    TokenType.INT,
    TokenType.EQUAL,
    TokenType.INTEGER,
    TokenType.SEMICOLON,
    TokenType.EOF
  ]);
});

test("syntax with arrow", () => {
  const tokens = tokenize("foo => bar + 1");

  const types = tokens.map(t => t.type);

  expect(types).toEqual([
    TokenType.IDENTIFIER,
    TokenType.ARROW,
    TokenType.IDENTIFIER,
    TokenType.PLUS,
    TokenType.INTEGER,
    TokenType.EOF
  ]);
});

test("multiple operators", () => {
  const tokens = tokenize("x<<y");

  const types = tokens.map(t => t.type);

  expect(types).toEqual([
    TokenType.IDENTIFIER,
    TokenType.LESS,
    TokenType.LESS,
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
});

test("whitespace and newlines", () => {
  const tokens = tokenize(`
    val   bar
      =
    67
  `);

  const types = tokens.map(t => t.type);

  expect(types).toEqual([
    TokenType.VAL,
    TokenType.IDENTIFIER,
    TokenType.EQUAL,
    TokenType.INTEGER,
    TokenType.EOF
  ]);
});

test("identifier and keyword", () => {
  const tokens = tokenize("value val");

  expect(tokens[0].type).toBe(TokenType.IDENTIFIER); 
  expect(tokens[1].type).toBe(TokenType.VAL);        
});

test("expression", () => {
  const tokens = tokenize("(x + 430) * y");

  const types = tokens.map(t => t.type);

  expect(types).toEqual([
    TokenType.LPAREN,
    TokenType.IDENTIFIER,
    TokenType.PLUS,
    TokenType.INTEGER,
    TokenType.RPAREN,
    TokenType.STAR,
    TokenType.IDENTIFIER,
    TokenType.EOF
  ]);
});

test("multiple statements", () => {
  const tokens = tokenize("val x = 1; val y = 2;");

  const types = tokens.map(t => t.type);

  expect(types).toEqual([
    TokenType.VAL,
    TokenType.IDENTIFIER,
    TokenType.EQUAL,
    TokenType.INTEGER,
    TokenType.SEMICOLON,
    TokenType.VAL,
    TokenType.IDENTIFIER,
    TokenType.EQUAL,
    TokenType.INTEGER,
    TokenType.SEMICOLON,
    TokenType.EOF
  ]);
});

test("unexpected character in middle of input", () => {
  const lexer = new Lexer("x @ y");

  lexer.nextToken(); 

  expect(() => lexer.nextToken()).toThrow("Unexpected character: @");
});

test("numbers followed by identifiers", () => {
  const tokens = tokenize("123abc");

  expect(tokens[0].type).toBe(TokenType.INTEGER);
  expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
});