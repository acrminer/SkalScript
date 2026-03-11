import { Lexer } from "./tokenizer/Lexer"
import { TokenType } from "./tokenizer/TokenType"

const input = "val x: Int = 5;"

const lexer = new Lexer(input)

let token

console.log("Input:", input)
console.log("Tokens:")

do {
  token = lexer.nextToken()

  if (token.value) {
    console.log(`${TokenType[token.type]} (${token.value})`)
  } else {
    console.log(TokenType[token.type])
  }

} while (token.type !== TokenType.EOF)
  //npx ts-node src/test.ts
  //The test runs the lexer on a sample input and prints the tokens it finds.