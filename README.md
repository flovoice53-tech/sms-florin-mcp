# sms-florin-mcp

[![npm version](https://img.shields.io/npm/v/sms-florin-mcp.svg)](https://www.npmjs.com/package/sms-florin-mcp)
[![npm downloads](https://img.shields.io/npm/dm/sms-florin-mcp.svg)](https://www.npmjs.com/package/sms-florin-mcp)

MCP server for [sms-florin](https://flo-voice1.com) — lets AI coding agents (Claude Code, Claude Desktop, Cursor, Codex, Windsurf, Cline...) rent a real UK phone number and receive an SMS/OTP verification code directly inside an agentic workflow. Useful when an agent is testing a signup/verification flow and needs a real code instead of a mocked one.

Numbers are real SIM cards on UK carrier networks (EE/Three) — not VoIP — via [sms-florin](https://flo-voice1.com)'s own GOIP hardware.

## Setup

Get an API key at [flo-voice1.com/api-access](https://flo-voice1.com/api-access) (balance is shared with your regular account).

### Claude Code / Claude Desktop

```bash
claude mcp add sms-florin -e SMS_FLORIN_API_KEY=your_key_here -- npx -y sms-florin-mcp
```

Or in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sms-florin": {
      "command": "npx",
      "args": ["-y", "sms-florin-mcp"],
      "env": { "SMS_FLORIN_API_KEY": "your_key_here" }
    }
  }
}
```

### Cursor / Windsurf / other MCP clients

Same shape — point the client's MCP config at `npx -y sms-florin-mcp` with `SMS_FLORIN_API_KEY` set in the env.

## Tools

| Tool | Description |
| --- | --- |
| `list_services` | List available services (WhatsApp, Telegram, Google, Discord...) and their prices. |
| `rent_number` | Rent a number for a service (`instant` or `monthly`), debiting your balance. Returns a `rentalId`. |
| `get_rental` | Check a rental's status, phone number, and any SMS received so far. |
| `wait_for_sms` | Block until the first SMS/OTP arrives, or time out — the one-step way to get a code in an automated flow. |

## Example flow

> Rent a WhatsApp number and wait for the verification code.

The agent calls `rent_number({ serviceSlug: "whatsapp" })`, then `wait_for_sms({ rentalId })`, and gets the code back to type into the signup form it's testing.

## Need one for your own API?

I build custom MCP servers like this one — npm package, published to the official Anthropic MCP registry / Docker MCP catalog / Glama, same setup as above. [Details on Fiverr](https://www.fiverr.com/florinbuilds), starting at $90.

## License

MIT
