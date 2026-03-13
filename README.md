# SkålScript Tokenizer

## Grammar
```
exp ::= IDENTIFIER 
      | INTEGER 
      | true 
      | false 
      | unit
      | '(' exp ')'
      | exp op exp

op ::= '+' | '-' | '*' | '/' | '<' | '=='

stmt ::= 'val' IDENTIFIER ':' type '=' exp ';'
       | 'var' IDENTIFIER ':' type '=' exp ';'
       | IDENTIFIER '=' exp ';'

program ::= algdef* funcdef* exp
```

## Tokens
- IDENTIFIER (IdentifierToken)

- INTEGER (IntegerToken)

- ( (LeftParenToken)

- ) (RightParenToken)

- { (LeftBraceToken)

- } (RightBraceToken)

- , (CommaToken)

- : (ColonToken)

- ; (SemicolonToken)

- _ (UnderscoreToken)

- + (PlusToken)

- - (MinusToken)

- * (StarToken)

- / (SlashToken)

- < (LessThanToken)

- == (EqualsEqualsToken)

- = (EqualsToken)

- => (ArrowToken)

- val (ValToken)

- var (VarToken)

- def (DefToken)

- algdef (AlgDefToken)

- match (MatchToken)

- case (CaseToken)

- true (TrueToken)

- false (FalseToken)

- unit (UnitToken)

- println (PrintlnToken)

- Int (IntTypeToken)

- Boolean (BooleanTypeToken)

- Unit (UnitTypeToken)

## Running the Tokenizer
To run the tokenizer locally:
1. Install dependencies

```bash
npm install
# SkålScript Tokenizer

## Grammar
```
exp ::= IDENTIFIER 
      | INTEGER 
      | true 
      | false 
      | unit
      | '(' exp ')'
      | exp op exp

op ::= '+' | '-' | '*' | '/' | '<' | '=='

stmt ::= 'val' IDENTIFIER ':' type '=' exp ';'
       | 'var' IDENTIFIER ':' type '=' exp ';'
       | IDENTIFIER '=' exp ';'

program ::= algdef* funcdef* exp
```

## Tokens
- IDENTIFIER (IdentifierToken)

- INTEGER (IntegerToken)

- ( (LeftParenToken)

- ) (RightParenToken)

- { (LeftBraceToken)

- } (RightBraceToken)

- , (CommaToken)

- : (ColonToken)

- ; (SemicolonToken)

- _ (UnderscoreToken)

- + (PlusToken)

- - (MinusToken)

- * (StarToken)

- / (SlashToken)

- < (LessThanToken)

- == (EqualsEqualsToken)

- = (EqualsToken)

- => (ArrowToken)

- val (ValToken)

- var (VarToken)

- def (DefToken)

- algdef (AlgDefToken)

- match (MatchToken)

- case (CaseToken)

- true (TrueToken)

- false (FalseToken)

- unit (UnitToken)

- println (PrintlnToken)

- Int (IntTypeToken)

- Boolean (BooleanTypeToken)

- Unit (UnitTypeToken)

## Running the Tokenizer
To run the tokenizer locally:
1. Install dependencies

```bash
npm install
