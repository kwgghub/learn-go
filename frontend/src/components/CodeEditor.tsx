import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, readOnly }: CodeEditorProps) {
  return (
    <div className="code-editor">
      <Editor
        height="100%"
        defaultLanguage="go"
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: false,
          padding: { top: 12 },
          quickSuggestions: true,
          parameterHints: { enabled: true },
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  )
}
