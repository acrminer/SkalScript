import { Parser } from "../parser/Parser"
import { tokenize } from "../lexer/tokenize"

describe("Parser more tests", () => {
    it("parses left-associative addition", () => {
        const parser = new Parser(tokenize("1 + 2 + 3"))
        expect(parser.parseExpression()).toEqual({
            kind: "BinaryExpression",
            operator: "+",
            left: {
                kind: "BinaryExpression",
                operator: "+",
                left: { kind: "IntegerLiteral", value: 1 },
                right: { kind: "IntegerLiteral", value: 2 }
            },
            right: { kind: "IntegerLiteral", value: 3 }
        })
    })

    it("parses mixed precedence chain", () => {
        const parser = new Parser(tokenize("1 + 2 * 3 + 4"))
        expect(parser.parseExpression()).toEqual({
            kind: "BinaryExpression",
            operator: "+",
            left: {
                kind: "BinaryExpression",
                operator: "+",
                left: { kind: "IntegerLiteral", value: 1 },
                right: {
                    kind: "BinaryExpression",
                    operator: "*",
                    left: { kind: "IntegerLiteral", value: 2 },
                    right: { kind: "IntegerLiteral", value: 3 }
                }
            },
            right: { kind: "IntegerLiteral", value: 4 }
    })
    })

    it("parses equality with lower precedence than <", () => {
        const parser = new Parser(tokenize("1 < 2 == 3"))
        expect(parser.parseExpression()).toEqual({
            kind: "BinaryExpression",
            operator: "==",
            left: {
                kind: "BinaryExpression",
                operator: "<",
                left: { kind: "IntegerLiteral", value: 1 },
                right: { kind: "IntegerLiteral", value: 2 }
            },
            right: { kind: "IntegerLiteral", value: 3 }
        })
    })

    it("parses deeply nested parentheses", () => {
        const parser = new Parser(tokenize("((1 + 2) * (4 - 3))"))
        expect(parser.parseExpression()).toEqual({
            kind: "BinaryExpression",
            operator: "*",
            left: {
                kind: "BinaryExpression",
                operator: "+",
                left: { kind: "IntegerLiteral", value: 1 },
                right: { kind: "IntegerLiteral", value: 2 }
            },
            right: {
                kind: "BinaryExpression",
                operator: "-",
                left: { kind: "IntegerLiteral", value: 4
                 },
                right: { kind: "IntegerLiteral", value: 3 }
            }
        })
    })

    it("throws on invalid expression", () => {
        const parser = new Parser(tokenize("+"))
        expect(() => parser.parseExpression()).toThrow()
    })

    it("parses identifiers in expressions", () => {
        const parser = new Parser(tokenize("x * y + z"))
        expect(parser.parseExpression()).toEqual({
            kind: "BinaryExpression",
            operator: "+",
            left: {
                kind: "BinaryExpression",
                operator: "*",
                left: { kind: "Identifier", name: "x" },
                right: { kind: "Identifier", name: "y" }
            },
            right: { kind: "Identifier", name: "z" }
        })
    })

    it("parses boolean in equality expression", () => {
        const parser = new Parser(tokenize("true == false"))
        expect(parser.parseExpression()).toEqual({
            kind: "BinaryExpression",
            operator: "==",
            left: { kind: "BooleanLiteral", value: true },
            right: { kind: "BooleanLiteral", value: false }
        })
    })

    it("parses unit in expression", () => {
        const parser = new Parser(tokenize("unit == unit"))
        expect(parser.parseExpression()).toEqual({
            kind: "BinaryExpression",
            operator: "==",
            left: { kind: "UnitLiteral" },
            right: { kind: "UnitLiteral" }
        })
    })

    it("parses println", () => {
    const parser = new Parser(tokenize("println(1)"))
    expect(parser.parseExpression()).toEqual({
      kind: "PrintlnExpression",
      argument: {
        kind: "IntegerLiteral",
        value: 1
      }
    })
  })

  it("parses function call", () => {
    const parser = new Parser(tokenize("f(1, 2)"))
    expect(parser.parseExpression()).toEqual({
      kind: "CallExpression",
      callee: {
        kind: "Identifier",
        name: "f"
      },
      arguments: [
        { kind: "IntegerLiteral", value: 1 },
        { kind: "IntegerLiteral", value: 2 }
      ]
    })
  })

  it("parses nested calls", () => {
    const parser = new Parser(tokenize("f(1)(2)"))
    expect(parser.parseExpression()).toEqual({
      kind: "CallExpression",
      callee: {
        kind: "CallExpression",
        callee: {
          kind: "Identifier",
          name: "f"
        },
        arguments: [{ kind: "IntegerLiteral", value: 1 }]
      },
      arguments: [{ kind: "IntegerLiteral", value: 2 }]
    })
  })

  it("parses block expression", () => {
    const parser = new Parser(tokenize("{ 1 2 3 }"))
    expect(parser.parseExpression()).toEqual({
      kind: "BlockExpression",
      expressions: [
        { kind: "IntegerLiteral", value: 1 },
        { kind: "IntegerLiteral", value: 2 },
        { kind: "IntegerLiteral", value: 3 }
      ]
    })
  })

  it("parses program", () => {
    const parser = new Parser(tokenize("1 + 2"))
    expect(parser.parseProgram()).toEqual({
      kind: "Program",
      body: {
        kind: "BinaryExpression",
        operator: "+",
        left: { kind: "IntegerLiteral", value: 1 },
        right: { kind: "IntegerLiteral", value: 2 }
      }
    })
  })
})
