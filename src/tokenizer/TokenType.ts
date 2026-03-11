export enum TokenType {
    IDENTIFIER,
    INTEGER,


    // keywords
    VAL,
    VAR,
    DEF,
    ALGDEF,
    MATCH,
    CASE,
    TRUE,
    FALSE,
    UNIT,
    PRINTLN,

    // built-in types
    INT,
    BOOLEAN,
    UNIT_TYPE,

    // punctuation
    LPAREN,
    RPAREN,
    LBRACE,
    RBRACE,
    COMMA,
    COLON,
    SEMICOLON,
    UNDERSCORE,

    //operators
    PLUS,
    MINUS,
    STAR,
    SLASH,
    LESS,
    EQUAL,
    DOUBLE_EQUAL,
    ARROW,

    EOF
}