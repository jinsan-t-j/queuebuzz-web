<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus across two active repositories:

- **queuebuzz-web** (1876 symbols, 3510 relationships, 153 execution flows)
- **queuebuzz** (2221 symbols, 4757 relationships, 152 execution flows)

Use the GitNexus MCP tools to understand code, assess impact, and navigate cross-repo boundaries safely.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `default_api:mcp_gitnexus_impact({target: "symbolName", direction: "upstream", repo: "queuebuzz-web"})` (or specify `repo: "queuebuzz"`) and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `default_api:mcp_gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `default_api:mcp_gitnexus_query({query: "concept", repo: "..."})` to find execution flows instead of grepping.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `default_api:mcp_gitnexus_context({name: "symbolName", repo: "..."})`.

## Never Do

- NEVER edit a function, class, or method without first running `default_api:mcp_gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `default_api:mcp_gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `default_api:mcp_gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource                                       | Use for                                  |
| ---------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/queuebuzz-web/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/queuebuzz-web/clusters`       | All functional areas                     |
| `gitnexus://repo/queuebuzz-web/processes`      | All execution flows                      |
| `gitnexus://repo/queuebuzz-web/process/{name}` | Step-by-step execution trace             |

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
