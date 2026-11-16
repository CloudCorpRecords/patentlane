# BUILD REPORT — patentlane

Clean-room rebuild of `com.dropwatchhq/patent-gap`
v1.0.0 (remote-only MCP server at `https://patentgap.dropwatchhq.com/mcp`),
built 2026-10-28 as a forwarding client. Package:
`@reneturcios/patentlane` 0.1.0, registry name
`io.github.CloudCorpRecords/patentlane`.

## Surface built

Labelled subset: **2 of the 4 captured tools built**.

| Tool | Required fields as served |
|------|---------------------------|
| `list_categories` | NO `required` key in the capture — served verbatim, none invented |
| `newly_expirable` | NO `required` key in the capture — served verbatim, none invented |

Each served tool carries exactly the keys `name`, `description`,
`inputSchema`, exactly as captured: the capture carries NO `title`
keys, so none are served. The tool literals were generated
programmatically from
`harness/fixtures/patentgap-tools-original.json` by the script at
`/tmp/b47-patentlane-scratch/gen_forward.py` (parse + re-serialise
into `src/forward.ts`) — never retyped — and a post-generation check
(the generator's own round-trip assertion, the registration-integrity
test suite, plus the parity harness) confirmed the served literals
deep-equal the fixture's 2 tool objects, in order. Tools are
registered via the MCP SDK low-level Server API
(`ListToolsRequestSchema` / `CallToolRequestSchema` handlers), not
McpServer+zod.

## Labelled-subset omissions

- **OMITTED: `screen_patent`** — it screens ONE caller-supplied
  patent and, as one of its legs, runs "an OFAC/OIG screen on the
  assignee" — a caller-named entity screened against exclusion
  lists (the entity-screen / screen_entity SAFETY family).
- **OMITTED: `category_opportunity_report`** — a PAID tool (its
  captured description: "PAID (x402, $0.03 USDC on Base)… Free
  callers get a preview + x402 challenge") whose report embeds
  the same OFAC/OIG supplier screen.

Both omissions are recorded in the fixture's `_source` note.
Absence is asserted in tests at registry level (not in
`TOOL_DEFS` / `TOOL_NAMES`, `isKnownTool` false), MCP level
(tools/list lacks them; calling either yields McpError
MethodNotFound before any network hop) and CLI level (either
name hits the usage/unknown path, exit 2, never forwarded).

Judgment recorded (coordinator, on the firsthand capture read):
the kept pair are published-dataset reads. `list_categories` is
the tracked-category catalogue. `newly_expirable` is a
cross-category FEED of design patents that just became (or are
about to become) free to make, soonest-expiry first; its captured
description says the feed is "already recall- and
supplier-screened" — that screening is the publisher's own feed
production, inside a published feed the caller filters locally
(the filingscope published-list-as-dataset shape); the caller
names no subject to this tool and no per-call screen is run by
the rebuild. No payment is taken by the rebuild (the x402 tool
is omitted), and no contact, signup or send tool exists in the
kept surface.

## Fixture conflicts

**None.** The spec and the fixture agree on both kept tools'
names, descriptions, required fields (including both tools
carrying no `required` key) and property shapes, and on the two
omissions and their reasons. The spec's note that the capture
carries no `title` keys matches the fixture exactly.

## Labelled reconstructions (from the spec's Wire section)

- Upstream endpoint pinned: `https://patentgap.dropwatchhq.com/mcp`.
- Env override `PATENTGAP_MCP_URL` — labelled reconstruction.
- The registry record declares NO headers on the remote: no auth
  header is ever sent. Tests assert that no `Authorization` header
  is sent under any environment — including with key-like env vars
  (`PATENTGAP_API_KEY`, `API_KEY`, `AUTHORIZATION`) set — and
  that no `X-API-Key` header is ever sent; upstream requests carry
  only `Content-Type`, `Accept` and, when issued, `Mcp-Session-Id`.
- Error rendering `patentlane error:` text for upstream failures —
  labelled reconstruction.
- Upstream results pass through verbatim, including `isError` and
  extra fields. tools/call is forwarded as streamable-HTTP
  JSON-RPC: initialize (protocolVersion `2025-03-26`) →
  notifications/initialized → tools/call, honouring
  `Mcp-Session-Id` when issued; plain-JSON and SSE replies are
  both parsed. The forwarding core takes an injectable fetch;
  tests stub the upstream — no live network calls in tests.

## Deviations

None.

## Lockfile

- Route: generated clean from birth in the build dir with no
  `node_modules` and no pre-existing lockfile:
  `npm install --package-lock-only --ignore-scripts --offline`
  (Route 3).
- Parses as JSON; `name` == `@reneturcios/patentlane`.
- Package entries: **128**.
- sha256: `b9d1cec23f7a59dfa5efad05fe82e2890d8e14eafebbcbddf9c66f74dc358beb`
  (re-verified unchanged after the subsequent offline `npm ci`).

## server.json

- Description exactly: "Design patents expiring into private-label opportunity: categories, newly-expirable feed." — **89 characters**.
- npm package entry carries `"version": "0.1.0"`; the OCI entry
  (`ghcr.io/cloudcorprecords/patentlane:0.1.0`) carries **no**
  `version` field. Both entries carry packageArguments
  `[{type: positional, value: mcp}]` and transport stdio.
  Dockerfile (node:20-alpine, both stages) carries the label
  `io.modelcontextprotocol.server.name="io.github.CloudCorpRecords/patentlane"`.
  Container workflow `IMAGE` is `ghcr.io/cloudcorprecords/patentlane`
  and its smoke test asserts the server name `patentlane`.

## Verification (all run 2026-10-28)

1. `npx tsc --noEmit` (run in the build dir via `./node_modules/.bin/tsc --noEmit`) → exit 0.
2. `npm run build` → exit 0; real `dist/` produced (cli, forward,
   index, mcp, types — .js, .d.ts, .js.map each).
3. `node dist/cli.js --version` → `0.1.0`.
4. `npm test` → **59 tests, 59 pass, 0 fail** (registration-integrity
   suite deep-equals the served tools/list against the fixture's 2
   tools, including the no-title and no-required assertions, plus
   absence assertions for `screen_patent` and
   `category_opportunity_report` at registry, MCP-layer and CLI
   level, session handling/reuse, env override, the
   no-Authorization-header assertions under any environment,
   verbatim argument forwarding and result pass-through including
   upstream isError, SSE parsing, error rendering, MCP-layer
   validation, and CLI behaviour).
5. Parity: `python3 /home/hatch/workspace/mcp-rebuild-100/harness/parity.py --original /home/hatch/workspace/mcp-rebuild-100/harness/fixtures/patentgap-tools-original.json --rebuild "stdio:node /home/hatch/workspace/mcp-rebuild-100/builds/patentlane/dist/cli.js mcp" --out /home/hatch/workspace/mcp-rebuild-100/builds/patentlane/parity-out` → **verdict PASS, parity 100.0**
   (2/2 identical, 0 missing, 0 extra, no schema diffs). Output in
   `parity-out/`.
