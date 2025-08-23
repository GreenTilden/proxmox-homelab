#!/bin/bash

# Test script for media organization system
# Creates sample files to test the identification and organization workflow

TEST_DIR="/staging-pool/recovery/test-samples"
LOG_FILE="/var/log/media-org-test.log"

log_test() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create test directory
mkdir -p "$TEST_DIR"

log_test "Creating test media files..."

# Create sample files that simulate recovered/carved media
# These would normally be the unnamed files from PhotoRec

# Sample 1: Large MP4 (simulates movie)
log_test "Creating movie sample..."
head -c 150M /dev/urandom > "$TEST_DIR/f000001.mp4"
echo "Creating test movie file" >> "$TEST_DIR/f000001.mp4"

# Sample 2: Medium MKV (simulates TV episode)
log_test "Creating TV episode sample..."
head -c 45M /dev/urandom > "$TEST_DIR/f000002.mkv"
echo "Creating test TV episode file" >> "$TEST_DIR/f000002.mkv"

# Sample 3: Small MP3 (simulates music)
log_test "Creating music sample..."
head -c 5M /dev/urandom > "$TEST_DIR/f000003.mp3"
echo "Creating test music file" >> "$TEST_DIR/f000003.mp3"

# Sample 4: Very small file (should be filtered out)
log_test "Creating small file (should be filtered)..."
echo "Too small" > "$TEST_DIR/f000004.mp4"

# Sample 5: AVI file
log_test "Creating AVI sample..."
head -c 85M /dev/urandom > "$TEST_DIR/f000005.avi"
echo "Creating test AVI file" >> "$TEST_DIR/f000005.avi"

log_test "Test files created. Directory contents:"
ls -lh "$TEST_DIR/" | tee -a "$LOG_FILE"

log_test "Testing media identifier script..."
if /usr/local/bin/media-identifier.sh "$TEST_DIR" "/media-pool/media/organized"; then
    log_test "Media identifier test completed successfully"
    
    log_test "Results:"
    for category in Movies TV-Shows Music Other; do
        local count=$(find "/media-pool/media/organized/$category" -type f 2>/dev/null | wc -l)
        log_test "  $category: $count files"
        if [ $count -gt 0 ]; then
            find "/media-pool/media/organized/$category" -type f | head -3 | while read file; do
                log_test "    $(basename "$file")"
            done
        fi
    done
else
    log_test "Media identifier test failed"
    exit 1
fi

log_test "Test completed! Check /media-pool/media/organized/ for results."

# Clean up test files
read -p "Clean up test files? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$TEST_DIR"
    find "/media-pool/media/organized" -name "f0000*" -delete
    log_test "Test files cleaned up"
fi