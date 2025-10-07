# Workspace Usage Guide - 5-Thread Development

**Status**: ✅ **ACTIVE** (2025-10-07)
**Updated**: 2025-10-07
**Location**: `/docs/UNIFIED-REFERENCE/OPERATIONS/workspace-usage-guide.md`

## Workspace Structure

Following GBGreg's proven workspace model:

```
/home/darney/projects/
├── proxmox-homelab/                  ← Main repo (stable production)
│   ├── docs/UNIFIED-REFERENCE/       ← Single source of truth
│   ├── .agents/                      ← Shared agent definitions
│   ├── .claude_mcp_config.json       ← MCP server config
│   ├── .env.notion                   ← Database IDs (gitignored)
│   ├── CLAUDE.md                     ← Project instructions
│   ├── scripts/
│   ├── configs/
│   └── frontend/
│
└── proxmox-homelab-threads/          ← Thread workspace
    ├── reader/    (reader branch - Sonnet)
    ├── writer/    (writer branch - Opus)
    ├── debug/     (debug branch - Opus)
    └── doc/       (doc branch - Sonnet)
```

**Result**: Only 2 folders in `/home/darney/projects/` instead of 5+!

## How to Launch Threads

### ⚠️ CRITICAL: Launch from Correct Directory

**WRONG** ❌:
```bash
cd /home/darney/projects/proxmox-homelab  # Main branch
claude  # Always works on main - NOT isolated!
```

**CORRECT** ✅:
```bash
# For Reader work:
cd /home/darney/projects/proxmox-homelab-threads/reader
claude

# For Writer work:
cd /home/darney/projects/proxmox-homelab-threads/writer
claude

# For Debug work:
cd /home/darney/projects/proxmox-homelab-threads/debug
claude

# For Documentation work:
cd /home/darney/projects/proxmox-homelab-threads/doc
claude

# For Main coordination:
cd /home/darney/projects/proxmox-homelab
claude
```

## Terminal Profile Setup

### Microsoft Terminal Profiles

Add these to your `settings.json`:

```json
{
  "profiles": {
    "list": [
      {
        "name": "Homelab - Main",
        "commandline": "bash",
        "startingDirectory": "/home/darney/projects/proxmox-homelab",
        "icon": "🎯"
      },
      {
        "name": "Homelab - Reader",
        "commandline": "bash",
        "startingDirectory": "/home/darney/projects/proxmox-homelab-threads/reader",
        "icon": "🔍"
      },
      {
        "name": "Homelab - Writer",
        "commandline": "bash",
        "startingDirectory": "/home/darney/projects/proxmox-homelab-threads/writer",
        "icon": "⚡"
      },
      {
        "name": "Homelab - Debug",
        "commandline": "bash",
        "startingDirectory": "/home/darney/projects/proxmox-homelab-threads/debug",
        "icon": "🔧"
      },
      {
        "name": "Homelab - Doc",
        "commandline": "bash",
        "startingDirectory": "/home/darney/projects/proxmox-homelab-threads/doc",
        "icon": "📚"
      }
    ]
  }
}
```

### Bash Aliases (Optional)

Add to `~/.bashrc`:

```bash
alias homelab-main='cd /home/darney/projects/proxmox-homelab'
alias homelab-reader='cd /home/darney/projects/proxmox-homelab-threads/reader'
alias homelab-writer='cd /home/darney/projects/proxmox-homelab-threads/writer'
alias homelab-debug='cd /home/darney/projects/proxmox-homelab-threads/debug'
alias homelab-doc='cd /home/darney/projects/proxmox-homelab-threads/doc'
```

## Shared Resources

### Symlinked Configs

All thread worktrees have symlinks to main repo:

```bash
# In each thread directory:
.env.notion -> ../../proxmox-homelab/.env.notion
.claude_mcp_config.json -> ../../proxmox-homelab/.claude_mcp_config.json
```

**Benefit**: Update config once in main, all threads see changes immediately.

### Git Worktree Behavior

**Documentation**: All threads automatically see `docs/UNIFIED-REFERENCE/` updates
**Commits**: Each thread commits to its own branch
**Merging**: Merge branches as needed, main coordinates

## Thread Responsibilities

### 🎯 Main Thread (Opus)
- **Directory**: `/home/darney/projects/proxmox-homelab`
- **Branch**: `main`
- **Role**: Orchestration, cycle coordination, task delegation
- **Notion**: Creates cycles, assigns tasks, coordinates handoffs

### 🔍 Reader Thread (Sonnet)
- **Directory**: `/home/darney/projects/proxmox-homelab-threads/reader`
- **Branch**: `reader`
- **Role**: Research, verification, status analysis
- **Notion**: Queries infrastructure, reads cycles (no writes)

### ⚡ Writer Thread (Opus)
- **Directory**: `/home/darney/projects/proxmox-homelab-threads/writer`
- **Branch**: `writer`
- **Role**: Implementation, deployment, system modifications
- **Notion**: Updates infrastructure DB, links docs

### 🔧 Debug Thread (Opus)
- **Directory**: `/home/darney/projects/proxmox-homelab-threads/debug`
- **Branch**: `debug`
- **Role**: Troubleshooting, issue resolution, knowledge capture
- **Notion**: Documents issues in tasks DB, updates resolutions

### 📚 Documentation Thread (Sonnet)
- **Directory**: `/home/darney/projects/proxmox-homelab-threads/doc`
- **Branch**: `doc`
- **Role**: Knowledge synthesis, documentation updates, archiving
- **Notion**: Enriches cycle metadata, syncs markdown

## Notion Integration

### ⚠️ MCP TOOLS ONLY - NO SCRIPTS

**Use**: Direct MCP tool calls via Claude during development
**Config**: Remote Notion MCP server at `https://mcp.notion.com/mcp`
**Auth**: OAuth through Notion app (no hardcoded tokens)

See: [Notion MCP Workflow](./notion-mcp-workflow.md) for complete guide.

## Workflow Example

### Starting a New Cycle

1. **Launch Main Thread**:
   ```bash
   cd /home/darney/projects/proxmox-homelab
   claude
   ```

2. **Create Notion Cycle** (via MCP):
   ```javascript
   mcp__notion__API-post-page({...})
   ```

3. **Launch Reader Thread**:
   ```bash
   # In new terminal
   cd /home/darney/projects/proxmox-homelab-threads/reader
   claude
   ```

4. **Reader Verifies System** (queries Notion via MCP)

5. **Handoff to Writer**:
   ```bash
   # In new terminal
   cd /home/darney/projects/proxmox-homelab-threads/writer
   claude
   ```

6. **Writer Implements** (updates Notion via MCP)

7. **Complete Cycle** - Main thread closes Notion cycle

## Troubleshooting

### "I'm always on main branch"
- **Issue**: Launching Claude from wrong directory
- **Fix**: Use terminal profiles or verify `pwd` before `claude`

### "MCP config not found"
- **Issue**: Symlink broken or not in workspace directory
- **Fix**: Check `ls -la .claude_mcp_config.json` shows symlink

### "Documentation out of sync"
- **Issue**: Editing in thread without git pull
- **Fix**: All threads share same docs via git worktree (automatic)

### "Can't update Notion"
- **Issue**: OAuth not completed or database IDs missing
- **Fix**: See [Notion MCP Workflow](./notion-mcp-workflow.md#troubleshooting)

## Best Practices

### ✅ DO
- Launch Claude from correct workspace directory for each thread
- Use terminal profiles to enforce correct starting directory
- Update Notion via MCP tools in real-time
- Commit work in thread branches, merge to main when complete
- Verify `pwd` shows expected workspace path

### ❌ DON'T
- Launch all sessions from `/home/darney/projects/proxmox-homelab`
- Create Notion sync scripts (use MCP tools only)
- Edit configs in thread directories (edit in main, symlinks propagate)
- Forget which thread you're in (check prompt/pwd)

## Quick Reference Commands

```bash
# Check current worktree
git worktree list

# See current branch
git branch --show-current

# Verify workspace location
pwd

# Check MCP config
ls -la .claude_mcp_config.json

# Verify Notion DB IDs
cat .env.notion
```

## Related Documentation

- [5-Thread Execution Model](../FRAMEWORK/5-thread-execution-model.md)
- [Notion MCP Workflow](./notion-mcp-workflow.md)
- [Thread Handoff Templates](../FRAMEWORK/thread-handoff-templates.md)

---

**Last Updated**: 2025-10-07
**Maintained By**: Main Thread
**Questions**: Reference CLAUDE.md Section "Workspace Model"
