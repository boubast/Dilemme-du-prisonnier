export interface RhaiSyntaxError {
  message: string
  lineNumber: number
  column: number
  length: number
}

interface BracketToken {
  char: "{" | "(" | "["
  lineNumber: number
  column: number
}

const CLOSING_BRACKETS: Record<BracketToken["char"], string> = {
  "{": "}",
  "(": ")",
  "[": "]",
}

const OPENING_BRACKETS = new Set(Object.keys(CLOSING_BRACKETS))
const CLOSING_TO_OPENING: Record<string, BracketToken["char"]> = {
  "}": "{",
  ")": "(",
  "]": "[",
}

function formatPosition(lineNumber: number, column: number) {
  return `ligne ${lineNumber}, colonne ${column}`
}

function makeError(
  message: string,
  lineNumber: number,
  column: number,
  length = 1
): RhaiSyntaxError {
  return {
    message,
    lineNumber,
    column,
    length,
  }
}

export function validateRhaiScript(script: string): RhaiSyntaxError | null {
  const stack: BracketToken[] = []
  let quote: '"' | "'" | null = null
  let quoteStartLine = 1
  let quoteStartColumn = 1
  let escaped = false
  let inLineComment = false
  let inBlockComment = false
  let blockCommentStartLine = 1
  let blockCommentStartColumn = 1
  let lineNumber = 1
  let column = 1

  for (let i = 0; i < script.length; i += 1) {
    const char = script[i]
    const nextChar = script[i + 1]

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false
        lineNumber += 1
        column = 1
      } else {
        column += 1
      }
      continue
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false
        i += 1
        column += 2
        continue
      }

      if (char === "\n") {
        lineNumber += 1
        column = 1
      } else {
        column += 1
      }
      continue
    }

    if (quote) {
      if (char === "\n") {
        return {
          message: `Chaîne de caractères non fermée (${formatPosition(
            quoteStartLine,
            quoteStartColumn
          )}).`,
          lineNumber: quoteStartLine,
          column: quoteStartColumn,
          length: 1,
        }
      }

      if (escaped) {
        escaped = false
      } else if (char === "\\") {
        escaped = true
      } else if (char === quote) {
        quote = null
      }

      column += 1
      continue
    }

    if (char === "/" && nextChar === "/") {
      inLineComment = true
      i += 1
      column += 2
      continue
    }

    if (char === "/" && nextChar === "*") {
      inBlockComment = true
      blockCommentStartLine = lineNumber
      blockCommentStartColumn = column
      i += 1
      column += 2
      continue
    }

    if (char === "=" && nextChar === "=" && script[i + 2] === "=") {
      return makeError(
        `Opérateur invalide "${script[i + 3] === "=" ? "====" : "==="}". Utilisez "==" pour comparer.`,
        lineNumber,
        column,
        script[i + 3] === "=" ? 4 : 3
      )
    }

    if (char === "\"" || char === "'") {
      quote = char
      quoteStartLine = lineNumber
      quoteStartColumn = column
      column += 1
      continue
    }

    if (OPENING_BRACKETS.has(char)) {
      stack.push({
        char: char as BracketToken["char"],
        lineNumber,
        column,
      })
      column += 1
      continue
    }

    if (char in CLOSING_TO_OPENING) {
      const expectedOpening = CLOSING_TO_OPENING[char]
      const lastOpening = stack.pop()

      if (!lastOpening) {
        return {
          message: `Fermeture "${char}" sans ouverture correspondante (${formatPosition(
            lineNumber,
            column
          )}).`,
          lineNumber,
          column,
          length: 1,
        }
      }

      if (lastOpening.char !== expectedOpening) {
        return {
          message: `Fermeture "${char}" invalide : "${CLOSING_BRACKETS[lastOpening.char]}" attendu pour "${lastOpening.char}" ouvert ${formatPosition(
            lastOpening.lineNumber,
            lastOpening.column
          )}.`,
          lineNumber,
          column,
          length: 1,
        }
      }

      column += 1
      continue
    }

    if (char === "\n") {
      lineNumber += 1
      column = 1
    } else {
      column += 1
    }
  }

  const firstCodeToken = script
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ")
    .trimStart()
    .match(/^[a-zA-Z_]\w*/)

  if (firstCodeToken?.[0] === "else") {
    const beforeElse = script.match(/^\s*/)
    const prefix = beforeElse?.[0] ?? ""
    const lineNumber = prefix.split("\n").length
    const lastLineBreak = prefix.lastIndexOf("\n")
    const column = lastLineBreak === -1 ? prefix.length + 1 : prefix.length - lastLineBreak

    return makeError(
      `"else" ne peut pas commencer un script Rhai : il doit suivre un bloc "if".`,
      lineNumber,
      column,
      4
    )
  }

  if (quote) {
    return {
      message: `Chaîne de caractères non fermée (${formatPosition(
        quoteStartLine,
        quoteStartColumn
      )}).`,
      lineNumber: quoteStartLine,
      column: quoteStartColumn,
      length: 1,
    }
  }

  if (inBlockComment) {
    return {
      message: `Commentaire de bloc non fermé (${formatPosition(
        blockCommentStartLine,
        blockCommentStartColumn
      )}).`,
      lineNumber: blockCommentStartLine,
      column: blockCommentStartColumn,
      length: 2,
    }
  }

  const lastOpening = stack.pop()
  if (lastOpening) {
    return {
      message: `"${CLOSING_BRACKETS[lastOpening.char]}" manquant pour "${lastOpening.char}" ouvert ${formatPosition(
        lastOpening.lineNumber,
        lastOpening.column
      )}.`,
      lineNumber: lastOpening.lineNumber,
      column: lastOpening.column,
      length: 1,
    }
  }

  return null
}
