# Coding patterns

## Style of coding

- Always prefer simple, readable code over compact, dense code.
- Avoid duplicating code, meaning search for existing code that can be reused instead of creating new code that is similar.
- Try to use already existing design and architecture patterns instead of inventing your own.
- Use meaningful variable and function names.
- Keep functions small and focused, ideally less than 50 lines of code.
- Keep classes and modules small and focused, ideally less than 300 lines of code. If larger, try to split them into smaller classes or modules.

## Error handling

- Always handle errors and edge cases.
- If an error is not handled, it should at least be logged.

## PowerShell Terminal Commands

When working on Windows with PowerShell, use proper PowerShell syntax for terminal commands:

### ❌ Incorrect (Bash-style syntax):
```
cd "path" && command
```

### ✅ Correct (PowerShell syntax):
```
Set-Location "path"; command
```

**Key differences:**
- Use `Set-Location` instead of `cd` for directory changes
- Use semicolon (`;`) instead of double ampersand (`&&`) for command chaining
- PowerShell does not recognize `&&` as a valid command separator

**Example:**
- ❌ `cd "c:\Users\PrahveenT\Documents\Projects\hackathon\backend" && dotnet new webapi`
- ✅ `Set-Location "c:\Users\PrahveenT\Documents\Projects\hackathon\backend"; dotnet new webapi`

