# Tilix Thread Theme System

## Overview
Automatic Tilix color theme switching based on which Claude Code worktree you're in.

## Color Scheme Mapping

| Thread | Directory | Theme | Colors |
|--------|-----------|-------|--------|
| 🎯 Main | `proxmox-homelab/` | SAE Main | Purple/Gold |
| 🔍 Reader | `proxmox-homelab-threads/reader/` | Coffee Reader | Earth tones |
| ⚡ Writer | `proxmox-homelab-threads/writer/` | Pacers Writer | Blue/Yellow |
| 🔧 Debug | `proxmox-homelab-threads/debug/` | Shadow Debug | Grey/Teal |
| 📚 Doc | `proxmox-homelab-threads/doc/` | Aqua Doc | Water tones |

## Usage

### Automatic Launch
From any worktree directory:
```bash
# Short alias
tt

# Or full command
tilix-thread

# Or direct script
./tilix-thread
```

### Manual Theme Selection in Tilix GUI
1. Open Tilix
2. Right-click → **Preferences**
3. **Profiles** tab → **Default** profile
4. **Color** sub-tab
5. Select theme from dropdown:
   - SAE Main
   - Coffee Reader
   - Pacers Writer
   - Shadow Debug
   - Aqua Doc

## How It Works

1. **Detection**: Script detects current directory path
2. **Mapping**: Matches path to appropriate thread theme
3. **Application**: Uses `dconf` to set Tilix colors
4. **Launch**: Opens Tilix with themed terminal

## Color Schemes Location
All theme JSON files are stored in:
```
~/.config/tilix/schemes/
├── SAE-Main.json
├── Coffee-Reader.json
├── Pacers-Writer.json
├── Shadow-Debug.json
└── Aqua-Doc.json
```

## Troubleshooting

### Theme doesn't apply automatically
```bash
# Check if dconf is installed
which dconf

# Manually reload Tilix preferences
dconf reset -f /com/gexperts/Tilix/
```

### Colors not loading
1. Open Tilix → Preferences
2. Manually select a color scheme once
3. Close and try script again

### Script not found
```bash
# Reload bash aliases
source ~/.bash_aliases

# Or use absolute path
~/projects/proxmox-homelab/scripts/tilix-thread.sh
```

## Customization

Edit theme colors by modifying JSON files in `~/.config/tilix/schemes/`

Each theme has:
- `foreground-color` - Text color
- `background-color` - Background color
- `cursor-foreground-color` - Cursor text
- `cursor-background-color` - Cursor color
- `palette` - 16 terminal colors (ANSI colors)

## Integration with 5-Thread Model

This system complements the worktree threading strategy:

```bash
# Example workflow
cd ~/projects/proxmox-homelab-threads/reader
tt  # Launches with Coffee Reader theme
claude  # Start Reader session

cd ~/projects/proxmox-homelab-threads/writer
tt  # Launches with Pacers Writer theme
claude  # Start Writer session
```

Visual themes help maintain mental context about which thread you're working in!
