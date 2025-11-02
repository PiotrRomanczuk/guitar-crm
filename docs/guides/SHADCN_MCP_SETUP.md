# Shadcn MCP Server Setup Guide

## Overview

The shadcn MCP (Model Context Protocol) server is now integrated into this project, enabling GitHub Copilot to access shadcn/ui component source code, examples, and documentation directly.

## What's Configured

✅ **MCP Server Installed**: Located at `.mcp/shadcn-server/`
✅ **VS Code Integration**: Configured in `.vscode/settings.json`
✅ **GitHub Copilot Support**: Ready to use with Copilot Chat

## Prerequisites

### 1. GitHub Personal Access Token (Recommended)

To avoid rate limits (60 requests/hour without token, 5000/hour with token):

1. Go to [GitHub Token Settings](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. **No scopes needed** - leave all checkboxes unchecked
4. Generate and copy the token

### 2. Set Environment Variable

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

Then reload: `source ~/.zshrc`

**Alternative**: Create `.env.local` in project root (gitignored):
```
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

## Usage with GitHub Copilot

### In Copilot Chat

The MCP server is automatically available when you use Copilot Chat in VS Code. Examples:

```
"Show me the shadcn/ui button component"
"Get the latest card component from shadcn"
"Show me the dashboard-01 block implementation"
"List all available shadcn components"
"Compare button and badge components"
```

### Available Tools

The MCP server provides these tools to Copilot:

- **`get_component_source`** - Get component TypeScript source code
- **`get_component_demo`** - Get component demo/example code
- **`get_block`** - Get complete block implementations (dashboards, forms, etc.)
- **`list_components`** - List all available components
- **`get_component_metadata`** - Get dependencies and descriptions
- **`list_repository_contents`** - Browse shadcn repo structure

## Manual Testing

Test the server independently:

```bash
# From project root
cd .mcp/shadcn-server
node build/index.js --help

# Test a component fetch
echo '{"method": "tools/call", "params": {"name": "get_component_source", "arguments": {"componentName": "button"}}}' | node build/index.js
```

## Troubleshooting

### Server Not Responding

1. Check if server builds correctly:
   ```bash
   cd .mcp/shadcn-server
   npm run build
   ```

2. Verify VS Code settings: Open `.vscode/settings.json` and check the configuration

3. Restart VS Code after configuration changes

### Rate Limit Issues

If you see "rate limit exceeded":
- Set up your GitHub token (see Prerequisites)
- Verify the token is exported: `echo $GITHUB_PERSONAL_ACCESS_TOKEN`

### Copilot Not Using MCP Tools

1. Make sure you're using Copilot Chat (Ctrl+Shift+I or Cmd+Shift+I)
2. Try explicitly mentioning "@shadcn-ui" in your prompt
3. Check Copilot output logs: View → Output → Select "GitHub Copilot Chat"

## Framework Support

Currently configured for **React** (default). To switch frameworks:

Edit `.vscode/settings.json` and add `--framework` argument:

```json
"args": [
  "${workspaceFolder}/.mcp/shadcn-server/build/index.js",
  "--framework",
  "svelte"  // or "vue", "react-native"
]
```

## Updating the Server

To update to the latest version:

```bash
cd .mcp/shadcn-server
git pull
npm install
npm run build
```

## Documentation

- [Full MCP Server Docs](.mcp/shadcn-server/README.md)
- [VS Code Integration](.mcp/shadcn-server/docs/integration/vscode.md)
- [API Reference](.mcp/shadcn-server/docs/api/)

## Benefits

- 🚀 **Faster Development**: No need to search shadcn docs manually
- 📦 **Always Updated**: Pulls latest component code from GitHub
- 🎯 **Accurate Code**: Gets exact source with proper types
- 🔍 **Easy Discovery**: Copilot can browse and suggest components
- 📚 **Examples Included**: Get demo code along with components

---

**Setup completed**: November 2, 2025
