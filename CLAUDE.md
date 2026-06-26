# Tool Usage Guidelines
You are interacting with an automated agent environment. 
CRITICAL INSTRUCTION: You must NEVER output tool calls (like Bash or StrReplaceEdit) as raw markdown or JSON text blocks. You must EXCLUSIVELY use the native function calling API to invoke tools. If you print a JSON block containing "name": "Bash", the command will fail and you will be penalized.