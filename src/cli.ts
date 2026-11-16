#!/usr/bin/env node
/**
 * patentlane CLI.
 *
 *   patentlane <tool> '<json-args>'
 *   patentlane mcp
 *   patentlane --version
 *
 * <tool> is one of the 2 captured forwarded tools in the
 * labelled subset. Each tool subcommand takes a single
 * JSON argument string holding that tool's arguments,
 * forwards the call the same way the MCP path does, and
 * prints the forwarded result content. Exit codes:
 * 0 success, 1 on an isError result, 2 usage error.
 * The omitted tools screen_patent and
 * category_opportunity_report are not CLI commands and
 * hit the usage path (exit 2).
 */
import { callTool, TOOL_NAMES, VERSION } from "./forward.js";
import type { ToolResult } from "./types.js";

function usage(): never {
  console.error(`Usage:
  patentlane <tool> '<json-args>'     one of: ${TOOL_NAMES.join(", ")}
  patentlane mcp
  patentlane --version`);
  process.exit(2);
}

function firstText(result: ToolResult): string {
  const content = result.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (
        item !== null &&
        typeof item === "object" &&
        (item as { type?: unknown }).type === "text" &&
        typeof (item as { text?: unknown }).text === "string"
      ) {
        return (item as { text: string }).text;
      }
    }
  }
  return typeof content === "string" ? content : JSON.stringify(content);
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "--version" || cmd === "-v") {
    console.log(VERSION);
    return;
  }
  if (cmd === "mcp") {
    if (rest.length !== 0) usage();
    const { startMcpServer } = await import("./mcp.js");
    await startMcpServer();
    return;
  }
  if (!TOOL_NAMES.includes(cmd ?? "")) usage();
  if (rest.length > 1) usage();
  let args: Record<string, unknown> = {};
  if (rest.length === 1) {
    try {
      const parsed: unknown = JSON.parse(rest[0]);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        usage();
      }
      args = parsed as Record<string, unknown>;
    } catch {
      console.error("error: argument must be a JSON object string");
      process.exit(2);
    }
  }
  const result = await callTool(cmd, args);
  if (result.isError) {
    console.error(`error: ${firstText(result)}`);
    process.exit(1);
  }
  console.log(
    typeof result.content === "string"
      ? result.content
      : JSON.stringify(result.content, null, 2),
  );
}

void main();
