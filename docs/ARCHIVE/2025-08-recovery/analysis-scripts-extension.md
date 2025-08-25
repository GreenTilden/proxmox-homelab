# Analysis Scripts Extension for App Drive Data

## Current Media Scripts Capability
- **Target**: Video/audio media files
- **Tools**: mediainfo, ffprobe for metadata extraction
- **Classification**: Movies, TV shows, music
- **Organization**: Smart sorting by metadata

## Extended Analysis for App Drive Data

### New File Types to Handle
```bash
# Document Analysis
- PDF files: pdfinfo, exiftool
- Office docs: libreoffice --headless --convert-to
- Text files: file command, encoding detection
- Archives: zipinfo, tar -tf, rar l

# Database Files
- SQLite: sqlite3 .schema, .tables
- MySQL dumps: head analysis, table extraction
- Config files: syntax validation, parameter extraction

# Software & Applications
- Executables: file command, ldd dependencies
- Installation packages: dpkg-deb -I, rpm -qip
- Source code: cloc, language detection
- Version control: git log --oneline, commit analysis
```

### Enhanced Media Identifier Script
```bash
# Extension to scripts/media-identifier.sh
identify_file_type() {
    local file="$1"
    local mime_type=$(file --mime-type -b "$file")
    
    case "$mime_type" in
        video/*|audio/*)
            # Existing media analysis
            analyze_media_file "$file"
            ;;
        application/pdf)
            analyze_pdf_file "$file"
            ;;
        application/vnd.sqlite3)
            analyze_database_file "$file"
            ;;
        application/zip|application/x-rar*)
            analyze_archive_file "$file"
            ;;
        text/*)
            analyze_text_file "$file"
            ;;
        application/x-executable)
            analyze_executable_file "$file"
            ;;
        *)
            analyze_unknown_file "$file"
            ;;
    esac
}
```

### New Analysis Functions

#### Document Analysis
```bash
analyze_pdf_file() {
    local file="$1"
    echo "PDF: $(pdfinfo "$file" | grep -E 'Title|Author|Pages|CreationDate')"
    echo "Size: $(stat -c%s "$file" | numfmt --to=iec-i)"
}

analyze_text_file() {
    local file="$1"
    local lines=$(wc -l < "$file")
    local encoding=$(file -bi "$file" | cut -d'=' -f2)
    echo "Text: $lines lines, encoding: $encoding"
    
    # Detect if it's a config file
    if [[ "$file" =~ \.(conf|cfg|ini|yaml|json)$ ]]; then
        echo "Config file detected: $(basename "$file")"
    fi
}
```

#### Database Analysis
```bash
analyze_database_file() {
    local file="$1"
    if command -v sqlite3 >/dev/null; then
        echo "SQLite Database:"
        sqlite3 "$file" ".tables" | tr '\n' ' ' | fold -w 80
        echo "Schema info: $(sqlite3 "$file" ".schema" | wc -l) statements"
    fi
}
```

#### Archive Analysis
```bash
analyze_archive_file() {
    local file="$1"
    local mime_type=$(file --mime-type -b "$file")
    
    case "$mime_type" in
        application/zip)
            echo "ZIP: $(unzip -l "$file" | tail -1 | awk '{print $2}') files"
            ;;
        application/x-rar*)
            echo "RAR: $(rar l "$file" | grep "files," | awk '{print $1}')"
            ;;
        application/x-tar*)
            echo "TAR: $(tar -tf "$file" | wc -l) files"
            ;;
    esac
}
```

### Enhanced Organization Categories
```bash
# Extend the directory structure
organize_by_type() {
    local file="$1"
    local base_dir="$2"
    
    case "$(identify_file_type "$file")" in
        "VIDEO_MEDIA")
            echo "$base_dir/media/videos/"
            ;;
        "AUDIO_MEDIA")
            echo "$base_dir/media/audio/"
            ;;
        "PDF_DOCUMENT")
            echo "$base_dir/documents/pdf/"
            ;;
        "DATABASE_FILE")
            echo "$base_dir/data/databases/"
            ;;
        "SOURCE_CODE")
            echo "$base_dir/development/source/"
            ;;
        "CONFIG_FILE")
            echo "$base_dir/configuration/"
            ;;
        "ARCHIVE_FILE")
            echo "$base_dir/archives/"
            ;;
        "EXECUTABLE")
            echo "$base_dir/software/binaries/"
            ;;
        *)
            echo "$base_dir/unsorted/"
            ;;
    esac
}
```

### Integration with Recovery Workflow

#### Stage 1: Analysis Phase
```bash
# Run extended analysis on recovered data
./scripts/enhanced-media-identifier.sh /staging-pool/recovered-data/

# Generate comprehensive report
./scripts/recovery-analysis-report.sh > /staging-pool/recovery-report.html
```

#### Stage 2: Smart Organization
```bash
# Organize by file type and importance
./scripts/organize-recovered-data.sh --input /staging-pool/recovered-data/ \
                                     --output /staging-pool/organized/ \
                                     --report /staging-pool/organization-log.txt
```

#### Stage 3: Duplicate Detection
```bash
# Enhanced duplicate detection across file types
fdupes -r /staging-pool/organized/ > /staging-pool/duplicates.txt
./scripts/smart-duplicate-handler.sh /staging-pool/duplicates.txt
```

### Priority Classification

#### High Priority (Auto-organize)
- Media files with complete metadata
- Documents with clear naming/dates
- Databases with schema information
- Source code repositories

#### Medium Priority (Review required)
- Unnamed media files
- Configuration files without context
- Archives requiring extraction
- Executables without version info

#### Low Priority (Manual review)
- Corrupted or partial files
- Unknown file types
- Temporary/cache files
- Duplicate candidates

### Command Examples
```bash
# Analyze a mixed directory
./scripts/enhanced-analysis.sh /staging-pool/recovered-data/

# Get file type statistics
./scripts/file-type-stats.sh /staging-pool/recovered-data/

# Smart organization with user review
./scripts/smart-organize.sh --interactive /staging-pool/recovered-data/
```

---
**Integration Notes**:
- Scripts maintain backward compatibility with media-only analysis
- All new functions are opt-in via command-line flags
- Analysis results stored in JSON format for programmatic access
- Web interface integration for file review and curation