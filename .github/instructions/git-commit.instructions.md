---
applyTo: "**"
---

#Git Commit Instructions

## Simple Git Workflow

### 1. Add Changes
```powershell
git add .
```

### 2. Commit Changes
```powershell
git commit -m "your commit message here"
```

### 3. Push to Remote
```powershell
git push
```

## Commit Message Examples

### Good Commit Messages
- `git commit -m "add user login functionality"`
- `git commit -m "fix login form validation"`
- `git commit -m "update API documentation"`
- `git commit -m "add new product endpoints"`

### Complete Example
```powershell
# Make your changes, then:
git add .
git commit -m "add user authentication to API"
git push
```

## First Time Setup (One Time Only)

### Configure Git User
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Add Remote Repository
```powershell
git remote add origin https://github.com/username/repository-name.git
```

## Quick Reference

| Command | What it does |
|---------|-------------|
| `git add .` | Add all changes to staging |
| `git commit -m "message"` | Commit with message |
| `git push` | Push to remote repository |
| `git status` | Check current status |
| `git pull` | Get latest changes from remote |