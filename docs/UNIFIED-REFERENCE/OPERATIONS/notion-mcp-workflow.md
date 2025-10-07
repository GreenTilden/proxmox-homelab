# Notion MCP Workflow - Proxmox Homelab

**Status**: ✅ **ACTIVE** (2025-10-07)
**Updated**: 2025-10-07
**Location**: `/docs/UNIFIED-REFERENCE/OPERATIONS/notion-mcp-workflow.md`

## Core Principle

**⚠️ MCP TOOLS ONLY - NO SCRIPTS**

This project uses **pure MCP tool integration** with Notion's remote MCP server.

❌ **DO NOT CREATE**:
- Node.js sync scripts with `@notionhq/client`
- Hardcoded API tokens in `.env` files
- Batch sync utilities
- Direct API calls

✅ **ONLY USE**:
- MCP tools via Claude (`mcp__notion__*`)
- Remote Notion MCP server at `https://mcp.notion.com/mcp`
- OAuth authentication through Notion app
- Real-time updates during development

## Architecture

### Configuration
```json
{
  "mcpServers": {
    "notion": {
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

**Location**: `/.claude_mcp_config.json` in main repo (symlinked to all threads)

### Authentication
- **Method**: OAuth through Notion app settings
- **Setup**: Notion Settings → Connections → Notion MCP → Authorize Claude
- **No tokens**: Authentication handled by remote MCP server

## Database Structure

### 5 Core Databases

1. **Cycles DB** - Development cycle tracking
   - Properties: Cycle #, Status, Start/End Date, Thread Status
   - Relations: Tasks, Infrastructure changes, Docs updated

2. **Tasks DB** - Task management
   - Properties: Task name, Status, Priority, Assigned Thread
   - Relations: Linked to cycles

3. **Infrastructure DB** - Services, containers, hardware
   - Properties: Component name, Type, Status, Location
   - Relations: Docs, monitoring metrics

4. **Docs DB** - Links to UNIFIED-REFERENCE markdown
   - Properties: File path, Category, Last updated
   - Relations: Cycles, infrastructure

5. **Monitoring DB** - System health and metrics
   - Properties: Metric name, Value, Threshold, Alert status
   - Relations: Infrastructure components

## Thread Workflows

### 🎯 Main Thread - Cycle Coordination

**Creating New Cycle:**
```javascript
mcp__notion__API-post-page({
  parent: { database_id: process.env.NOTION_CYCLES_DB },
  properties: {
    title: [{ text: { content: "Cycle 7: GPU Passthrough Setup" } }],
    Status: { status: { name: "In Progress" } },
    "Start Date": { date: { start: "2025-10-07" } }
  }
})
```

**Linking Tasks to Cycle:**
```javascript
mcp__notion__API-patch-page({
  page_id: "<cycle_page_id>",
  properties: {
    "Related Tasks": {
      relation: [
        { id: "<task_1_id>" },
        { id: "<task_2_id>" }
      ]
    }
  }
})
```

### 🔍 Reader Thread - Research & Verification

**Read-only operations** - Query databases for context:

```javascript
// Check current cycles
mcp__notion__API-post-database-query({
  database_id: process.env.NOTION_CYCLES_DB,
  filter: {
    property: "Status",
    status: { equals: "In Progress" }
  }
})

// Verify infrastructure status
mcp__notion__API-post-database-query({
  database_id: process.env.NOTION_INFRASTRUCTURE_DB,
  filter: {
    property: "Status",
    select: { equals: "Active" }
  }
})
```

**No write operations** - Reader thread verifies but does not modify.

### ⚡ Writer Thread - Implementation Updates

**Document Service Deployments:**
```javascript
// Create infrastructure entry
mcp__notion__API-post-page({
  parent: { database_id: process.env.NOTION_INFRASTRUCTURE_DB },
  properties: {
    title: [{ text: { content: "Plex Media Server" } }],
    Type: { select: { name: "LXC Container" } },
    Status: { select: { name: "Active" } },
    Location: { rich_text: [{ text: { content: "CT 100" } }] }
  }
})

// Link documentation
mcp__notion__API-post-page({
  parent: { database_id: process.env.NOTION_DOCS_DB },
  properties: {
    title: [{ text: { content: "plex-deployment.md" } }],
    Path: { rich_text: [{
      text: { content: "/docs/UNIFIED-REFERENCE/OPERATIONS/plex-deployment.md" }
    }] },
    "Related Infrastructure": {
      relation: [{ id: "<plex_infrastructure_id>" }]
    }
  }
})
```

### 🔧 Debug Thread - Issue Documentation

**Document Issues and Resolutions:**
```javascript
// Create task for issue
mcp__notion__API-post-page({
  parent: { database_id: process.env.NOTION_TASKS_DB },
  properties: {
    title: [{ text: { content: "Fix GPU passthrough IOMMU groups" } }],
    Status: { status: { name: "In Progress" } },
    Priority: { select: { name: "High" } },
    "Assigned Thread": { select: { name: "Debug" } }
  }
})

// Update with resolution
mcp__notion__API-patch-page({
  page_id: "<task_id>",
  properties: {
    Status: { status: { name: "Resolved" } }
  }
})

// Append resolution notes
mcp__notion__API-patch-block-children({
  block_id: "<task_page_id>",
  children: [
    {
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "Resolution" } }]
      }
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [{
          type: "text",
          text: { content: "Updated GRUB config with intel_iommu=on..." }
        }]
      }
    }
  ]
})
```

### 📚 Documentation Thread - Knowledge Synthesis

**At Cycle Completion:**
```javascript
// Update cycle metadata
mcp__notion__API-patch-page({
  page_id: "<cycle_page_id>",
  properties: {
    Status: { status: { name: "Complete" } },
    "End Date": { date: { start: "2025-10-10" } },
    "Docs Updated": {
      relation: [
        { id: "<doc_1_id>" },
        { id: "<doc_2_id>" }
      ]
    }
  }
})
```

## Common MCP Patterns

### Query Database with Filters
```javascript
mcp__notion__API-post-database-query({
  database_id: "<db_id>",
  filter: {
    and: [
      { property: "Status", status: { equals: "Active" } },
      { property: "Type", select: { equals: "Service" } }
    ]
  },
  sorts: [
    { property: "Name", direction: "ascending" }
  ]
})
```

### Create Page with Multiple Properties
```javascript
mcp__notion__API-post-page({
  parent: { database_id: "<db_id>" },
  properties: {
    title: [{ text: { content: "Page Title" } }],
    Status: { status: { name: "Active" } },
    "Start Date": { date: { start: "2025-10-07" } },
    Tags: { multi_select: [
      { name: "Homelab" },
      { name: "Infrastructure" }
    ] },
    RelatedDocs: { relation: [{ id: "<page_id>" }] }
  }
})
```

### Append Content to Page
```javascript
mcp__notion__API-patch-block-children({
  block_id: "<page_id>",
  children: [
    {
      type: "paragraph",
      paragraph: {
        rich_text: [{
          type: "text",
          text: { content: "Implementation notes..." }
        }]
      }
    },
    {
      type: "code",
      code: {
        language: "bash",
        rich_text: [{
          type: "text",
          text: { content: "pct create 100 local:vztmpl/ubuntu-22.04..." }
        }]
      }
    }
  ]
})
```

## Best Practices

### ✅ DO
- Update Notion in real-time as you work (not at cycle end)
- Use MCP tools directly during Claude sessions
- Keep markdown as source of truth (git-controlled)
- Use Notion for relationships and metadata
- Verify database IDs are in `.env.notion`

### ❌ DON'T
- Create Node.js sync scripts
- Hardcode API tokens anywhere
- Batch sync at end of cycle
- Edit Notion directly without updating markdown
- Skip verification of relationships

## Troubleshooting

### Connection Issues
```javascript
// Test MCP connection
mcp__notion__API-get-self()
// Should return workspace info if OAuth is working
```

### Database Access
```javascript
// Verify database access
mcp__notion__API-post-database-query({
  database_id: process.env.NOTION_CYCLES_DB,
  page_size: 1
})
// Should return at least structure if permissions are correct
```

### Rate Limiting
- Notion API: ~180 requests/minute (3/second)
- MCP server handles throttling automatically
- Spread updates throughout development, not in batches

## Setup Checklist

- [ ] `.claude_mcp_config.json` created in main repo
- [ ] `.env.notion` with database IDs configured
- [ ] Both files symlinked to all thread worktrees
- [ ] OAuth completed through Notion app
- [ ] 5 core databases created in Notion workspace
- [ ] Test MCP connection from each thread
- [ ] Update CLAUDE.md with Notion workflow reference

## Related Documentation

- [5-Thread Execution Model](../FRAMEWORK/5-thread-execution-model.md)
- [Thread Handoff Templates](../FRAMEWORK/thread-handoff-templates.md)
- [Workspace Structure](./workspace-usage-guide.md)

---

**Last Updated**: 2025-10-07
**Maintained By**: Main Thread
**Questions**: Reference CLAUDE.md Section "Notion Integration"
