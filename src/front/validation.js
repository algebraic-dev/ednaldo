const KEYWORDS = ['val', 'fn', 'if', 'else', 'const', 'and', 'or', 'elif', 'ednaldo', 'endnaldo', 'Vocevaletudo', 'V ocevalenada', 'Nil', "for","in"];

// As funções abaixo são uteis para a validação de chars e
// strings que vão ser utilizadas pelo lexer para criar os
// lexemas.

function isDigit(char) {
  return char >= '0' && char <= '9';
}

function isOperator(char) {
  return ['+', '-', '*', '/', '(', ')', '[', ']', '{', '}', '>', '<', '=', '.', ',', '|', '^', '&', '@', '#', '?', '!', ':'].includes(char);
}

function isUseless(char) {
  return [' ', '\t', '\n', '\r'].includes(char);
}

function isValidStartOfIdentifierCharacter(char) {
  return !isUseless(char) && !isDigit(char) && !isOperator(char) && char !== undefined;
}

function isValidIdentifierCharacter(char) {
  return !isUseless(char) && !isOperator(char) && char !== undefined;
}

function checkIdType(value) {
  return KEYWORDS.includes(value) ? value[0].toUpperCase() + value.substring(1, value.length) : 'Identifier';
}

module.exports = {
  isDigit, isValidIdentifierCharacter, isValidStartOfIdentifierCharacter, checkIdType, isUseless,
};
