# Data Recovery Priority Matrix

## Critical Priority (Irreplaceable)
- [ ] Personal projects/code repositories
- [ ] Documents (tax, legal, personal)
- [ ] Photos/personal videos
- [ ] Configuration files/backups
- [ ] SSH keys, certificates, passwords

## High Priority (Difficult to recreate)
- [ ] Development environments
- [ ] Virtual machine images
- [ ] Database backups
- [ ] Custom scripts/automation

## Medium Priority (Re-downloadable but time-consuming)
- [ ] Plex media library
- [ ] Game installations
- [ ] Software installers
- [ ] OS ISOs

## Drive-by-Drive Recovery Plan

### sda (1.8T) - General Storage Drive
- **Type**: Mixed general storage, likely documents and backups
- **Priority data**: Personal documents, project files, photos, configuration backups
- **Recovery method**: 
  - Full photorec scan with focus on documents (PDF, DOC, TXT)
  - Image recovery (JPG, PNG, RAW)
  - Archive extraction (ZIP, TAR, 7Z)
- **Risk level**: Medium-High (potential personal data)
- **Recovery order**: 3rd (after SSD and targeted media scan)

### sdb (3.6T) - Media Drive (Primary Plex Storage)
- **Type**: Plex media library + possible personal video/photo overflow
- **Priority data**: 
  - Personal videos/photos (CRITICAL if present)
  - Plex media library (Medium priority)
  - Check for non-media folders (Documents, Projects)
- **Recovery method**: 
  - PhotoRec with video/audio focus (MP4, MKV, AVI, MP3, FLAC)
  - Manual string search for personal folder structures
  - Priority scan for family photos/videos before media files
- **Risk level**: Medium (mostly replaceable media, but check for personal content)
- **Recovery order**: 2nd (large capacity, potential personal data mixed in)

### sdc (698G) - Games Drive
- **Type**: Game installations + possible personal project storage
- **Priority data**: 
  - Game save files (important but game-specific)
  - Personal files that might be stored in game directories
  - Development projects (if using games drive for storage)
  - Mods and custom content
- **Recovery method**:
  - PhotoRec scan for documents and archives
  - Look for save game patterns (.sav, .dat, profiles)
  - Check for hidden personal folders
- **Risk level**: Low-Medium (mostly replaceable games)
- **Recovery order**: 4th (lowest priority unless personal data found)

### sdd (223G) - SSD Drive  
- **Type**: High-speed storage for active/important data
- **Priority data**: 
  - Recent project work (CRITICAL)
  - Development environments and source code
  - Documents in active use
  - Browser data, SSH keys, certificates
  - System configurations and dotfiles
- **Recovery method**:
  - **HIGHEST PRIORITY** - Full clone before any operations
  - Comprehensive photorec scan (all file types)
  - String analysis for code patterns, config files
  - Manual examination of recovered folder structures
- **Risk level**: HIGHEST (likely contains most recent/important work)
- **Recovery order**: 1st (clone immediately, recover completely)

## Recovery Execution Plan

### Phase 1: Immediate Protection (Day 1)
1. **Create full disk clones** of all drives (especially SSD)
   ```bash
   ddrescue /dev/sdd /backup/sdd_clone.img /backup/sdd.log
   ddrescue /dev/sdb /backup/sdb_clone.img /backup/sdb.log
   ddrescue /dev/sda /backup/sda_clone.img /backup/sda.log
   ddrescue /dev/sdc /backup/sdc_clone.img /backup/sdc.log
   ```

### Phase 2: Critical Data Recovery (Days 2-3)
1. **SSD Recovery** (sdd - 223G)
   - Run comprehensive photorec on clone
   - Manual file structure reconstruction
   - Priority: code files, documents, configurations

2. **Media Drive Selective Recovery** (sdb - 3.6T)
   - Quick scan for personal photos/videos first
   - Selective Plex media recovery if needed

### Phase 3: Comprehensive Recovery (Days 4-7)
1. **Storage Drive Recovery** (sda - 1.8T)
   - Full photorec scan
   - Document and photo recovery
   
2. **Games Drive Assessment** (sdc - 698G)
   - Scan for unexpected personal data
   - Game save recovery if valuable

### Phase 4: Verification and Cleanup (Week 2)
1. **Verify recovered files**
2. **Organize and deduplicate**
3. **Plan new storage architecture**

## Recovery Tools and Commands

### Essential Tools
```bash
# Install recovery tools
apt update && apt install foremost photorec testdisk ddrescue

# Safe examination (read-only)
./scripts/data-inventory-scan.sh

# File carving (work on clones only)
photorec /path/to/clone.img

# Low-level analysis
strings /dev/device | grep -i pattern
hexdump -C /dev/device | head -100
```

### Recovery Success Metrics
- **Critical**: Personal documents, photos, code projects recovered
- **High**: Development environments and databases recovered  
- **Medium**: Significant portion of media library recovered
- **Acceptable**: At least irreplaceable personal data recovered

## Post-Recovery Actions
1. **Audit recovered data** for completeness
2. **Implement robust backup strategy** before reusing drives
3. **Document lessons learned** for future prevention
4. **Plan new Proxmox storage architecture** without single points of failure