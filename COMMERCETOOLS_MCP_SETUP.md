# commercetools MCP Server Setup Guide

This guide will help you set up the commercetools Model Context Protocol (MCP) server for use with Cursor IDE.

## Overview

commercetools provides two MCP servers:

1. **Commerce MCP** - Direct access to your commercetools project (requires credentials)
   - Manage carts, orders, products, customers
   - Requires API access to your commercetools project
   - Usage limits: 1,000,000 invocations for non-production use
   - Production use requires a paid license

2. **Developer MCP** - Documentation and API specs (free, no credentials)
   - Access to commercetools documentation
   - GraphQL schema and OpenAPI specs
   - No project access required

## Prerequisites

- Node.js 18+ installed
- commercetools project credentials:
  - `CTP_PROJECT_KEY`
  - `CTP_CLIENT_ID`
  - `CTP_CLIENT_SECRET`
  - `CTP_AUTH_URL` (e.g., `https://auth.us-east-2.aws.commercetools.com`)
  - `CTP_API_URL` (e.g., `https://api.us-east-2.aws.commercetools.com`)

## Setup Options

### Option 1: Using Environment Variables (Recommended for Security)

This approach uses environment variables from your `.env.local` file, keeping credentials out of the config file.

**Step 1:** Ensure your `.env.local` has the commercetools credentials:

```bash
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_AUTH_URL=https://auth.us-east-2.aws.commercetools.com
CTP_API_URL=https://api.us-east-2.aws.commercetools.com
```

**Step 2:** Update `.vscode/mcp.json` or `.cursor/mcp.json`:

```json
{
  "servers": {
    "commercetools Commerce MCP": {
      "command": "npx",
      "args": [
        "-y",
        "@commercetools/commerce-mcp@latest",
        "--tools=all",
        "--authType=client_credentials",
        "--clientId=${CTP_CLIENT_ID}",
        "--clientSecret=${CTP_CLIENT_SECRET}",
        "--projectKey=${CTP_PROJECT_KEY}",
        "--authUrl=${CTP_AUTH_URL}",
        "--apiUrl=${CTP_API_URL}"
      ],
      "env": {
        "CTP_CLIENT_ID": "${CTP_CLIENT_ID}",
        "CTP_CLIENT_SECRET": "${CTP_CLIENT_SECRET}",
        "CTP_PROJECT_KEY": "${CTP_PROJECT_KEY}",
        "CTP_AUTH_URL": "${CTP_AUTH_URL}",
        "CTP_API_URL": "${CTP_API_URL}"
      }
    }
  }
}
```

**Note:** If environment variable substitution doesn't work in your IDE, use Option 2 or Option 3.

### Option 2: Using a Config File

Create a separate config file for commercetools MCP credentials.

**Step 1:** Create `.mcp/commercetools-config.json` (add to `.gitignore`):

```json
{
  "tools": "all",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "projectKey": "YOUR_PROJECT_KEY",
  "authUrl": "https://auth.us-east-2.aws.commercetools.com",
  "apiUrl": "https://api.us-east-2.aws.commercetools.com",
  "port": 8888,
  "logging": true
}
```

**Step 2:** Update `.vscode/mcp.json` or `.cursor/mcp.json`:

```json
{
  "servers": {
    "commercetools Commerce MCP": {
      "command": "npx",
      "args": [
        "-y",
        "@commercetools/commerce-mcp@latest",
        "--config=.mcp/commercetools-config.json"
      ]
    }
  }
}
```

**Step 3:** Add to `.gitignore`:

```
.mcp/commercetools-config.json
```

### Option 3: Direct Credentials (Less Secure)

If the above options don't work, you can put credentials directly in the config file. **Warning:** This is less secure and should not be committed to version control.

```json
{
  "servers": {
    "commercetools Commerce MCP": {
      "command": "npx",
      "args": [
        "-y",
        "@commercetools/commerce-mcp@latest",
        "--tools=all",
        "--authType=client_credentials",
        "--clientId=YOUR_CLIENT_ID",
        "--clientSecret=YOUR_CLIENT_SECRET",
        "--projectKey=YOUR_PROJECT_KEY",
        "--authUrl=https://auth.us-east-2.aws.commercetools.com",
        "--apiUrl=https://api.us-east-2.aws.commercetools.com"
      ]
    }
  }
}
```

## Cursor IDE Configuration

For Cursor IDE specifically, the MCP configuration file should be located at:

- **User-level**: `~/.cursor/mcp.json` (macOS/Linux) or `%USERPROFILE%\.cursor\mcp.json` (Windows)
- **Project-level**: `.cursor/mcp.json` or `.vscode/mcp.json` in your project root

## Verification

After configuring the MCP server:

1. **Restart Cursor IDE** to load the new configuration
2. **Test the connection** by asking Cursor:
   - "What products are in my commercetools project?"
   - "Show me the project configuration"
   - "What countries are configured?"

If the setup is correct, Cursor will use the commercetools MCP connection to provide relevant information.

## Troubleshooting

### MCP Server Not Connecting

1. **Check Node.js version**: Ensure Node.js 18+ is installed
   ```bash
   node --version
   ```

2. **Test the MCP server manually**:
   ```bash
   npx -y @commercetools/commerce-mcp@latest \
     --tools=all \
     --authType=client_credentials \
     --clientId=YOUR_CLIENT_ID \
     --clientSecret=YOUR_CLIENT_SECRET \
     --projectKey=YOUR_PROJECT_KEY \
     --authUrl=YOUR_AUTH_URL \
     --apiUrl=YOUR_API_URL
   ```

3. **Check credentials**: Verify your commercetools credentials are correct
4. **Check network**: Ensure you can access commercetools APIs
5. **Check logs**: Look for error messages in Cursor's output panel

### Environment Variables Not Working

If environment variable substitution doesn't work:
- Use Option 2 (config file) or Option 3 (direct credentials)
- Ensure your `.env.local` file is in the project root
- Restart Cursor IDE after updating environment variables

### Permission Issues

If you get permission errors:
- Ensure the API client has the necessary scopes in commercetools
- Check that the project key is correct
- Verify the auth and API URLs match your commercetools region

## Usage Limits

**Non-Production Use:**
- Up to 1,000,000 invocations free
- For development, evaluation, and testing

**Production Use:**
- Requires a valid paid commercetools license
- Contact your commercetools representative for licensing

## Additional Configuration

### Disable Data Transformation

By default, commercetools MCP transforms JSON data into tabular format. To disable this and return raw JSON:

Add to your config:
```json
{
  "toolOutputFormat": "json"
}
```

Or set environment variable:
```bash
TOOL_OUTPUT_FORMAT=json
```

### Enable Logging

To enable logging to stdout:
```json
{
  "logging": true
}
```

## Resources

- [commercetools MCP Documentation](https://docs.commercetools.com/sdk/mcp/overview)
- [Commerce MCP Guide](https://docs.commercetools.com/sdk/mcp/commerce-mcp)
- [Developer MCP Guide](https://docs.commercetools.com/sdk/mcp/developer-mcp)
- [Cursor MCP Documentation](https://docs.cursor.com/advanced/model-context-protocol)

## Next Steps

After setting up the MCP server:

1. Test basic queries about your commercetools project
2. Try asking Cursor to help with:
   - Product management tasks
   - Cart and order operations
   - Project configuration questions
3. Explore the available MCP tools for commercetools operations
