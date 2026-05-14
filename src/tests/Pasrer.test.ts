import { Parser } from "../parser/Parser"
import { tokenize } from "../lexer/tokenize"

describe("Parser", () => {

  //test that a simple integer is parsed into an IntegerLiteral node
  it("parses an integer literal", () => {
    const parser = new Parser(tokenize("42"))
    expect(parser.parseExpression()).toEqual({
      kind: "IntegerLiteral",
      value: 42
    })
  })

  //test that a single variable name is parsed as an Identifier node
  it("parses an identifier", () => {
    const parser = new Parser(tokenize("x"))
    expect(parser.parseExpression()).toEqual({
      kind: "Identifier",
      name: "x"
    })
  })

  //test that addition creates a BinaryExpression with '+' operator
  it("parses addition", () => {
    const parser = new Parser(tokenize("1 + 2"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "+",
      left: {
        kind: "IntegerLiteral",
        value: 1
      },
      right: {
        kind: "IntegerLiteral",
        value: 2
      }
    })
  })

  //test that multiplication has higher precedence than addition
  //so 2 * 3 is grouped before adding to 1
  it("parses multiplication before addition", () => {
    const parser = new Parser(tokenize("1 + 2 * 3"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "+",
      left: {
        kind: "IntegerLiteral",
        value: 1
      },
      right: {
        kind: "BinaryExpression",
        operator: "*",
        left: {
          kind: "IntegerLiteral",
          value: 2
        },
        right: {
          kind: "IntegerLiteral",
          value: 3
        }
      }
    })
  })

  //test that parentheses override normal operator precedence
  //so (1 + 2) is evaluated before multiplication
  it("parses parenthesized expressions", () => {
    const parser = new Parser(tokenize("(1 + 2) * 3"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "*",
      left: {
        kind: "BinaryExpression",
        operator: "+",
        left: {
          kind: "IntegerLiteral",
          value: 1
        },
        right: {
          kind: "IntegerLiteral",
          value: 2
        }
      },
      right: {
        kind: "IntegerLiteral",
        value: 3
      }
    })
  })

  //test that less-than comparison is parsed correctly
  it("parses less-than expressions", () => {
    const parser = new Parser(tokenize("1 < 2"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "<",
      left: {
        kind: "IntegerLiteral",
        value: 1
      },
      right: {
        kind: "IntegerLiteral",
        value: 2
      }
    })
  })

  //test that equality comparison creates a BinaryExpression with '==' operator
  it("parses equality expressions", () => {
    const parser = new Parser(tokenize("x == y"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "==",
      left: {
        kind: "Identifier",
        name: "x"
      },
      right: {
        kind: "Identifier",
        name: "y"
      }
    })
  })

  //test that boolean keywords are parsed as BooleanLiteral nodes
  it("parses boolean literals", () => {
    const parser = new Parser(tokenize("true"))
    expect(parser.parseExpression()).toEqual({
      kind: "BooleanLiteral",
      value: true
    })
  })

  //test that the unit keyword is parsed as a UnitLiteral node
  it("parses unit literal", () => {
    const parser = new Parser(tokenize("unit"))
    expect(parser.parseExpression()).toEqual({
      kind: "UnitLiteral"
    })
  })

  //test that an incomplete expression (missing right operand)
  //throws a parsing error
  it("throws on incomplete expression", () => {
    const parser = new Parser(tokenize("1 +"))
    expect(() => parser.parseExpression()).toThrow()
  })

  //test that missing closing parenthesis causes an error
  it("throws on missing closing parenthesis", () => {
    const parser = new Parser(tokenize("(1 + 2"))
    expect(() => parser.parseExpression()).toThrow("Expected ')' after expression.")
  })

  //test that comparison operators are evaluated before equality
  //so 1 < 2 is grouped first, then compared with true
  it("parses comparison before equality", () => {
    const parser = new Parser(tokenize("1 < 2 == true"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "==",
      left: {
        kind: "BinaryExpression",
        operator: "<",
        left: {
          kind: "IntegerLiteral",
          value: 1
        },
        right: {
          kind: "IntegerLiteral",
          value: 2
        }
      },
      right: {
        kind: "BooleanLiteral",
        value: true
      }
    })
  })

  //test that greater-than comparison is parsed correctly
  it("parses greater-than expressions", () => {
    const parser = new Parser(tokenize("3 > 2"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: ">",
      left: {
        kind: "IntegerLiteral",
        value: 3
      },
      right: {
        kind: "IntegerLiteral",
        value: 2
      }
    })
  })

  //NEW TESTS

  //test nested parentheses
  it("parses nested parentheses", () => {
    const parser = new Parser(tokenize("((1 + 2) * 3)"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "*",
      left: {
        kind: "BinaryExpression",
        operator: "+",
        left: {
          kind: "IntegerLiteral",
          value: 1
        },
        right: {
          kind: "IntegerLiteral",
          value: 2
        }
      },
      right: {
        kind: "IntegerLiteral",
        value: 3
      }
    })
  })

  //test chained addition
  it("parses chained addition left associatively", () => {
    const parser = new Parser(tokenize("1 + 2 + 3"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "+",
      left: {
        kind: "BinaryExpression",
        operator: "+",
        left: {
          kind: "IntegerLiteral",
          value: 1
        },
        right: {
          kind: "IntegerLiteral",
          value: 2
        }
      },
      right: {
        kind: "IntegerLiteral",
        value: 3
      }
    })
  })

  //test multiplication chain
  it("parses chained multiplication", () => {
    const parser = new Parser(tokenize("2 * 3 * 4"))
    expect(parser.parseExpression()).toEqual({
      kind: "BinaryExpression",
      operator: "*",
      left: {
        kind: "BinaryExpression",
        operator: "*",
        left: {
          kind: "IntegerLiteral",
          value: 2
        },
        right: {
          kind: "IntegerLiteral",
          value: 3
        }
      },
      right: {
        kind: "IntegerLiteral",
        value: 4
      }
    })
  })

  //test invalid token sequence
  it("throws on invalid token sequence", () => {
    const parser = new Parser(tokenize("1 + * 2"))
    expect(() => parser.parseExpression()).toThrow()
  })

  //test empty input
  it("throws on empty input", () => {
    const parser = new Parser(tokenize(""))
    expect(() => parser.parseExpression()).toThrow()
  })

})