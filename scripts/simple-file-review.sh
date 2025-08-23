#!/bin/bash
# Simple File Review Script for Data Recovery
# No external dependencies required

STAGING_ROOT="/mnt/staging"
REVIEW_LOG="/tmp/file_review.log"

echo "=== RECOVERY FILE REVIEW SYSTEM ==="
echo "Date: $(date)"
echo "Staging root: $STAGING_ROOT"
echo ""

# Create review log header if needed
if [ ! -f "$REVIEW_LOG" ]; then
    echo "# File Review Log - $(date)" > "$REVIEW_LOG"
    echo "# Format: ACTION|PATH|SIZE|DATE" >> "$REVIEW_LOG"
fi

# Function to show file info and get decision
review_file() {
    local filepath="$1"
    local relpath="${filepath#$STAGING_ROOT/}"
    local size=$(stat -c%s "$filepath" 2>/dev/null || echo "0")
    local size_mb=$((size / 1024 / 1024))
    local modified=$(stat -c%y "$filepath" 2>/dev/null | cut -d' ' -f1)
    
    echo "----------------------------------------"
    echo "File: $relpath"
    echo "Size: ${size_mb} MB"
    echo "Modified: $modified"
    echo "Type: $(file -b "$filepath" 2>/dev/null | head -1)"
    echo ""
    echo "Actions: [k]eep  [d]elete  [u]nsure  [s]kip  [q]uit"
    read -p "Decision: " decision
    
    case "$decision" in
        k|K) echo "KEEP|$relpath|$size|$modified" >> "$REVIEW_LOG"
             echo "✅ Marked for KEEP" ;;
        d|D) echo "DELETE|$relpath|$size|$modified" >> "$REVIEW_LOG"
             echo "🗑️ Marked for DELETE" ;;
        u|U) echo "UNSURE|$relpath|$size|$modified" >> "$REVIEW_LOG"
             echo "❓ Marked as UNSURE" ;;
        s|S) echo "⏭️ Skipped" ;;
        q|Q) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid choice, skipping..." ;;
    esac
    echo ""
}

# Function to show current statistics
show_stats() {
    if [ -f "$REVIEW_LOG" ]; then
        local keep_count=$(grep "^KEEP|" "$REVIEW_LOG" | wc -l)
        local delete_count=$(grep "^DELETE|" "$REVIEW_LOG" | wc -l)
        local unsure_count=$(grep "^UNSURE|" "$REVIEW_LOG" | wc -l)
        
        echo "=== REVIEW STATISTICS ==="
        echo "Keep: $keep_count files"
        echo "Delete: $delete_count files"
        echo "Unsure: $unsure_count files"
        echo ""
    fi
}

# Function to execute decisions
execute_decisions() {
    echo "=== EXECUTING REVIEW DECISIONS ==="
    read -p "Are you sure you want to DELETE marked files? [y/N]: " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        local deleted=0
        while IFS='|' read -r action filepath size date; do
            if [ "$action" = "DELETE" ]; then
                local fullpath="$STAGING_ROOT/$filepath"
                if [ -f "$fullpath" ]; then
                    rm "$fullpath" && echo "Deleted: $filepath" && ((deleted++))
                fi
            fi
        done < <(grep "^DELETE|" "$REVIEW_LOG")
        
        echo "Deleted $deleted files"
    else
        echo "Execution cancelled"
    fi
}

# Main menu
while true; do
    show_stats
    echo "=== MAIN MENU ==="
    echo "1. Review files interactively"
    echo "2. Show all reviewed files"
    echo "3. Execute delete decisions"
    echo "4. Generate web report"
    echo "5. Exit"
    echo ""
    read -p "Choose option [1-5]: " choice
    
    case $choice in
        1) echo "Starting interactive review..."
           find "$STAGING_ROOT" -type f -not -name "*.log" -not -name "*.img" | while read -r file; do
               review_file "$file"
           done ;;
        2) if [ -f "$REVIEW_LOG" ]; then
               echo "=== ALL REVIEWED FILES ==="
               column -t -s'|' "$REVIEW_LOG" | grep -v "^#"
           else
               echo "No review data found"
           fi ;;
        3) execute_decisions ;;
        4) echo "Web report: Access via SSH and run 'cat $REVIEW_LOG'" ;;
        5) echo "Goodbye!"; exit 0 ;;
        *) echo "Invalid choice" ;;
    esac
    echo ""
    read -p "Press Enter to continue..."
done