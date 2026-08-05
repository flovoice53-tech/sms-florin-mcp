#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SmsFlorinClient, SmsFlorinError } from "sms-florin";
import { z } from "zod";

const apiKey = process.env.SMS_FLORIN_API_KEY;
if (!apiKey) {
  console.error(
    "SMS_FLORIN_API_KEY is not set. Get one at https://flo-voice1.com/api-access and pass it as an env var.",
  );
  process.exit(1);
}

const client = new SmsFlorinClient(apiKey, {
  baseUrl: process.env.SMS_FLORIN_BASE_URL,
});

function text(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function errorText(error: unknown) {
  const message = error instanceof SmsFlorinError ? error.message : String(error);
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}

const server = new McpServer({ name: "sms-florin-mcp", version: "0.1.1" });

server.registerTool(
  "list_services",
  {
    title: "List services",
    description:
      "List the services sms-florin can rent a UK phone number for (WhatsApp, Telegram, Google, Discord, etc.), with their prices.",
    inputSchema: {},
  },
  async () => {
    try {
      return text(await client.listServices());
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "rent_number",
  {
    title: "Rent a phone number",
    description:
      "Rent a real UK phone number for a given service so it can receive an SMS/OTP verification code. Debits the account balance. Returns a rentalId to check with get_rental or wait_for_sms.",
    inputSchema: {
      serviceSlug: z
        .string()
        .describe('Service slug from list_services, e.g. "whatsapp", "google", "discord".'),
      period: z
        .enum(["instant", "monthly"])
        .default("instant")
        .describe("instant = one-time rental for a single code; monthly = keep the number for a month."),
    },
  },
  async ({ serviceSlug, period }) => {
    try {
      return text(await client.rentNumber(serviceSlug, period));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "get_rental",
  {
    title: "Get rental status",
    description: "Check a rental's status, phone number, and any SMS messages received so far.",
    inputSchema: {
      rentalId: z.number().int().describe("The rentalId returned by rent_number."),
    },
  },
  async ({ rentalId }) => {
    try {
      return text(await client.getRental(rentalId));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "wait_for_sms",
  {
    title: "Wait for SMS",
    description:
      "Block until the first SMS/OTP code arrives on a rental, or time out. The one-step way to rent a number and get the code in an automated flow.",
    inputSchema: {
      rentalId: z.number().int().describe("The rentalId returned by rent_number."),
      timeoutMs: z.number().int().positive().default(120_000).describe("Max time to wait, in ms."),
      intervalMs: z.number().int().positive().default(3_000).describe("Poll interval, in ms."),
    },
  },
  async ({ rentalId, timeoutMs, intervalMs }) => {
    try {
      return text(await client.waitForSms(rentalId, { timeoutMs, intervalMs }));
    } catch (error) {
      return errorText(error);
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("sms-florin-mcp failed to start:", error);
  process.exit(1);
});
