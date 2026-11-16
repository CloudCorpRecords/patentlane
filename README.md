# patentlane

Which design patents have just expired, and what could you now make and sell under your own label? patentlane is a local forwarding client for the hosted Patent-Gap MCP service: it answers `tools/list` locally from the captured tool definitions and forwards every call to the service, returning the answers exactly as the service sends them back.

Two published-dataset reads are built here. `list_categories` is the catalogue of private-label product categories the service tracks for expiring design patents. `newly_expirable` is the cross-category feed of design patents that just became, or are about to become, free to make, soonest-expiry first. The feed description in the capture notes it is already recall- and supplier-screened by the publisher as part of producing the feed; the caller names no subject to either tool and this client runs no per-call screen of its own.

This is a labelled subset: 2 of the 4 captured tools are built. `screen_patent` is omitted because it screens a caller-supplied patent and, as one leg, runs an OFAC/OIG screen on the assignee — a caller-named entity screened against exclusion lists. `category_opportunity_report` is omitted because it is a paid tool (x402, $0.03 USDC on Base, with a preview plus challenge for free callers) whose report embeds the same OFAC/OIG supplier screen. Neither omitted tool is registered, served, or offered by the CLI, and no payment is taken by this rebuild.

## The tools

- **`list_categories`** — List the private-label product categories Patent-Gap tracks for expiring design patents. No parameters, and no required parameters in the capture.
- **`newly_expirable`** — The cross-category feed of design patents that just became (or are about to become) free to make: fresh off-patent private-label opportunities, soonest-expiry first, already recall- and supplier-screened by the publisher. Cap the feed with `limit` (default 30). No required parameters.

## Install and run

As an MCP server via npm:

```bash
npx -y @reneturcios/patentlane mcp
```

MCP client configuration:

```json
{
  "mcpServers": {
    "patentlane": {
      "command": "npx",
      "args": ["-y", "@reneturcios/patentlane", "mcp"]
    }
  }
}
```

As a container:

```bash
docker run -i ghcr.io/cloudcorprecords/patentlane
docker run --rm ghcr.io/cloudcorprecords/patentlane newly_expirable '{}'
```

## CLI

One binary serves both the command line and the MCP server. Each tool is a subcommand taking a single JSON string with that tool's arguments:

```bash
patentlane list_categories '{}'
patentlane newly_expirable '{"limit":10}'
patentlane --version
```

Exit codes: `0` when the forwarded call succeeds, `1` when the upstream result is an error, and `2` for usage problems such as an unknown subcommand (including either omitted tool name) or a malformed JSON argument.

## Configuration

- `PATENTGAP_MCP_URL` — Overrides the upstream endpoint. The default is the pinned hosted endpoint, `https://patentgap.dropwatchhq.com/mcp`. (The override variable is a reconstruction added by this rebuild.)

The upstream registry record declares no headers, so no authentication header is ever sent; the tool surface was captured keyless.

Upstream failures — a JSON-RPC error from the service, a non-2xx response, an unreadable body, or a request that fails outright — are reported to the caller as an error result whose text starts with `patentlane error:`.

## How forwarding works

The first forwarded call opens a session: an `initialize` request (protocol version `2025-03-26`), followed by a `notifications/initialized` notification, then the `tools/call` itself. If the service answers the initialize request with an `Mcp-Session-Id` header, that value is carried on every later request, and the open session is reused for the rest of the process. Replies are accepted either as plain JSON or as server-sent events. Successful results pass through verbatim, including any `isError` flag and any extra fields the service includes.

## Development

```bash
npm install
npm run build   # tsc -> dist/ (dist/cli.js is the bin)
npm test        # tsx --test test/*.test.ts — stubbed upstream, no network
npm run dev     # run the CLI from source
```

The test suite checks the served tool list against the captured subset (all 2 tools, deep-equal, in order, with no titles invented and no `required` key added to either tool), asserts the two omitted tools are absent at registry, MCP-layer and CLI level, exercises the session handshake and its reuse, verifies that no `Authorization` header is ever sent under any environment, and verifies that arguments go upstream untouched and results come back untouched.

## License

MIT — see `LICENSE`. Copyright (c) 2026 Rene Turcios.
