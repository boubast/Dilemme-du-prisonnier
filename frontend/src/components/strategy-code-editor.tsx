import { useEffect, useMemo, useRef, useState } from "react"
import { Editor } from "@monaco-editor/react"
import type {
  BeforeMount,
  Monaco,
  OnChange,
  OnMount,
} from "@monaco-editor/react"
import type { Position, editor } from "monaco-editor"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { validateRhaiScript } from "@/lib/rhai-validation"

const RHAI_LANGUAGE_ID = "rhai"
const DARK_QUERY = "(prefers-color-scheme: dark)"
const EDITOR_DARK_BACKGROUND = "#090b0c"
let rhaiCompletionProviderRegistered = false

interface StrategyCodeEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
}

function getSystemTheme() {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light"
}

function updateRhaiMarkers(
  editorInstance: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  script: string
) {
  const model = editorInstance.getModel()
  if (!model) {
    return
  }

  const syntaxError = validateRhaiScript(script)
  monaco.editor.setModelMarkers(
    model,
    RHAI_LANGUAGE_ID,
    syntaxError
      ? [
          {
            message: syntaxError.message,
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: syntaxError.lineNumber,
            startColumn: syntaxError.column,
            endLineNumber: syntaxError.lineNumber,
            endColumn: syntaxError.column + syntaxError.length,
          },
        ]
      : []
  )
}

function useResolvedTheme() {
  const { theme } = useTheme()
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">(() =>
    getSystemTheme()
  )

  useEffect(() => {
    if (theme !== "system") {
      return undefined
    }

    const mediaQuery = window.matchMedia(DARK_QUERY)
    const handleChange = () => setSystemTheme(getSystemTheme())

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  return theme === "system" ? systemTheme : theme
}

const configureRhai: BeforeMount = (monaco) => {
  const languages = monaco.languages.getLanguages() as Array<{ id: string }>

  if (!languages.some((language) => language.id === RHAI_LANGUAGE_ID)) {
    monaco.languages.register({
      id: RHAI_LANGUAGE_ID,
      extensions: [".rhai"],
      aliases: ["Rhai", "rhai"],
    })
  }

  monaco.languages.setLanguageConfiguration(RHAI_LANGUAGE_ID, {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    indentationRules: {
      increaseIndentPattern: /^.*(\{[^}"']*|\([^)"']*|\[[^\]"']*)$/,
      decreaseIndentPattern: /^\s*[}\])].*$/,
    },
    onEnterRules: [
      {
        beforeText: /^.*\{\s*$/,
        afterText: /^\s*\}/,
        action: {
          indentAction: monaco.languages.IndentAction.IndentOutdent,
        },
      },
      {
        beforeText: /^.*\{\s*$/,
        action: {
          indentAction: monaco.languages.IndentAction.Indent,
        },
      },
    ],
  })

  if (!rhaiCompletionProviderRegistered) {
    monaco.languages.registerCompletionItemProvider(RHAI_LANGUAGE_ID, {
      triggerCharacters: [":"],
      provideCompletionItems: (
        model: editor.ITextModel,
        position: Position
      ) => {
        const lineUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })
        const choiceMatch = lineUntilPosition.match(/\bChoice::([A-Z_]*)$/)

        if (!choiceMatch) {
          return {
            suggestions: [],
          }
        }

        const typedVariant = choiceMatch[1]
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - typedVariant.length,
          endColumn: position.column,
        }

        return {
          suggestions: [
            {
              label: "Choice::COOPERATE",
              kind: monaco.languages.CompletionItemKind.EnumMember,
              insertText: "COOPERATE",
              detail: "Choice enum",
              documentation: "Returns the cooperate choice.",
              range,
            },
            {
              label: "Choice::BETRAY",
              kind: monaco.languages.CompletionItemKind.EnumMember,
              insertText: "BETRAY",
              detail: "Choice enum",
              documentation: "Returns the betray choice.",
              range,
            },
          ],
        }
      },
    })
    rhaiCompletionProviderRegistered = true
  }

  monaco.languages.setMonarchTokensProvider(RHAI_LANGUAGE_ID, {
    defaultToken: "",
    tokenPostfix: ".rhai",
    keywords: [
      "as",
      "break",
      "case",
      "catch",
      "const",
      "continue",
      "do",
      "else",
      "export",
      "false",
      "fn",
      "for",
      "global",
      "if",
      "import",
      "in",
      "is",
      "let",
      "loop",
      "private",
      "return",
      "switch",
      "throw",
      "true",
      "try",
      "type",
      "while",
    ],
    builtins: [
      "print",
      "debug",
      "eval",
      "rand",
      "len",
      "push",
      "pop",
      "contains",
      "is_empty",
      "to_string",
      "to_debug",
    ],
    domainTypes: ["Choice"],
    enumVariants: ["COOPERATE", "BETRAY"],
    properties: ["value", "field_0", "field_1", "len"],
    variables: [
      "last_current_stokes",
      "last_opposing_stokes",
      "cout_trahison",
      "cout_cooperation",
      "cout_trahison_cooperation",
      "cout_cooperation_trahison",
      "history",
    ],
    operators: [
      "=",
      ">",
      "<",
      "!",
      "~",
      "?",
      ":",
      "==",
      "<=",
      ">=",
      "!=",
      "&&",
      "||",
      "++",
      "--",
      "+",
      "-",
      "*",
      "/",
      "%",
      "**",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
    ],
    symbols: /[=><!~?:&|+*/%^-]+/,
    tokenizer: {
      root: [
        [
          /([A-Z][\w$]*)(::)([A-Z][\w$]*)/,
          ["type.identifier", "delimiter.double-colon", "constant.enum"],
        ],
        [
          /(\.)([a-zA-Z_]\w*)/,
          [
            "delimiter.dot",
            {
              cases: {
                "@properties": "property",
                "@builtins": "function",
                "@default": "identifier",
              },
            },
          ],
        ],
        [
          /[a-zA-Z_]\w*(?=\s*\()/,
          {
            cases: {
              "@keywords": "keyword",
              "@builtins": "function",
              "@default": "function",
            },
          },
        ],
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              "@keywords": "keyword",
              "@builtins": "function",
              "@domainTypes": "type.identifier",
              "@enumVariants": "constant.enum",
              "@variables": "variable.predefined",
              "@default": "identifier",
            },
          },
        ],
        [/[A-Z][\w$]*/, "type.identifier"],
        { include: "@whitespace" },
        [/[{}()[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],
        [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F_]+/, "number.hex"],
        [/\d+/, "number"],
        [/[;,.]/, "delimiter"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string_double"],
        [/'([^'\\]|\\.)*$/, "string.invalid"],
        [/'/, "string", "@string_single"],
      ],
      whitespace: [
        [/[ \t\r\n]+/, ""],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],
      string_double: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"],
      ],
      string_single: [
        [/[^\\']+/, "string"],
        [/\\./, "string.escape"],
        [/'/, "string", "@pop"],
      ],
    },
  })

  monaco.editor.defineTheme("rhai-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "5b21b6", fontStyle: "bold" },
      { token: "operator", foreground: "0369a1" },
      { token: "type.identifier", foreground: "047857" },
      { token: "constant.enum", foreground: "7c3aed", fontStyle: "bold" },
      { token: "property", foreground: "2563eb" },
      { token: "function", foreground: "0891b2" },
      { token: "variable.predefined", foreground: "0f766e" },
      { token: "delimiter.double-colon", foreground: "64748b" },
      { token: "delimiter.dot", foreground: "64748b" },
      { token: "string", foreground: "b45309" },
      { token: "number", foreground: "be123c" },
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
    ],
    colors: {
      "editor.background": "#f8fafc",
      "editor.foreground": "#111827",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#4f46e5",
      "editorIndentGuide.background1": "#e2e8f0",
      "editor.selectionBackground": "#c7d2fe",
    },
  })

  monaco.editor.defineTheme("rhai-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "a78bfa", fontStyle: "bold" },
      { token: "operator", foreground: "38bdf8" },
      { token: "type.identifier", foreground: "34d399" },
      { token: "constant.enum", foreground: "f472b6", fontStyle: "bold" },
      { token: "property", foreground: "60a5fa" },
      { token: "function", foreground: "22d3ee" },
      { token: "variable.predefined", foreground: "2dd4bf" },
      { token: "delimiter.double-colon", foreground: "94a3b8" },
      { token: "delimiter.dot", foreground: "94a3b8" },
      { token: "string", foreground: "fbbf24" },
      { token: "number", foreground: "fb7185" },
      { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
    ],
    colors: {
      "editor.background": EDITOR_DARK_BACKGROUND,
      "editor.foreground": "#f8fafc",
      "editorLineNumber.foreground": "#64748b",
      "editorLineNumber.activeForeground": "#a78bfa",
      "editorIndentGuide.background1": "#334155",
      "editor.selectionBackground": "#4338ca",
    },
  })
}

export function StrategyCodeEditor({
  id = "strategy-code",
  value,
  onChange,
}: StrategyCodeEditorProps) {
  const resolvedTheme = useResolvedTheme()
  const monacoTheme = resolvedTheme === "dark" ? "rhai-dark" : "rhai-light"
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)

  const options = useMemo(
    () => ({
      autoClosingBrackets: "always" as const,
      autoClosingQuotes: "always" as const,
      autoIndent: "advanced" as const,
      bracketPairColorization: {
        enabled: true,
      },
      detectIndentation: false,
      fixedOverflowWidgets: true,
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 13,
      formatOnPaste: true,
      formatOnType: true,
      insertSpaces: true,
      lineNumbers: "on" as const,
      minimap: {
        enabled: false,
      },
      padding: {
        top: 10,
        bottom: 10,
      },
      renderLineHighlight: "line" as const,
      roundedSelection: false,
      scrollBeyondLastLine: false,
      tabSize: 4,
      wordWrap: "on" as const,
    }),
    []
  )

  const handleChange: OnChange = (nextValue) => {
    onChange(nextValue ?? "")
  }

  const handleMount: OnMount = (editor, monaco) => {
    editor.getDomNode()?.setAttribute("id", id)
    editorRef.current = editor
    monacoRef.current = monaco
    updateRhaiMarkers(editor, monaco, value)
  }

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      updateRhaiMarkers(editorRef.current, monacoRef.current, value)
    }
  }, [value])

  return (
    <div
      className={cn(
        "min-h-50 flex-1 overflow-hidden rounded-md border border-input bg-muted/30",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50"
      )}
    >
      <Editor
        beforeMount={configureRhai}
        defaultLanguage={RHAI_LANGUAGE_ID}
        height="100%"
        language={RHAI_LANGUAGE_ID}
        loading={
          <span className="text-xs text-muted-foreground">
            Loading editor...
          </span>
        }
        onChange={handleChange}
        onMount={handleMount}
        options={options}
        theme={monacoTheme}
        value={value}
        width="100%"
      />
    </div>
  )
}
