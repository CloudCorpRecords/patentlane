# Changelog

## 0.1.0 (2026-10-28)

- First release: a forwarding client for the hosted Patent-Gap MCP server, as a labelled subset of 2 of the 4 captured tools. The 2 built tools are answered locally for tools/list, and every tools/call is forwarded upstream over a streamable-HTTP JSON-RPC session (initialize, notifications/initialized, tools/call, honouring the Mcp-Session-Id header when the upstream issues one).
- Tools: `list_categories`, `newly_expirable`. Labelled subset: `screen_patent` and `category_opportunity_report` are omitted and are not registered, served, or offered by the CLI. The capture carries no `title` keys, so none are served; neither built tool carries a `required` key in the capture and none is served.
- Upstream results pass through verbatim, including the isError flag; upstream failures surface as `patentlane error:` text results.
- One bin serves the CLI (one subcommand per tool, plus `--version`) and the stdio MCP server (`mcp` subcommand). The upstream endpoint can be overridden via `PATENTGAP_MCP_URL`. The upstream record declares no headers, so no auth header is ever sent.
