#!/usr/bin/env python3
"""
DVD Episode Extractor
Extracts individual episodes from DVD VIDEO_TS folders using ffmpeg
"""

import os
import subprocess
import sys
from pathlib import Path

def run_ffmpeg_docker(input_path, output_path, start_time=None, duration=None):
    """Run ffmpeg via Docker container"""

    # Base command
    cmd = [
        'docker', 'run', '--rm',
        '-v', '/staging-pool:/staging-pool',
        '-v', '/media-pool:/media-pool',
        'jrottenberg/ffmpeg:latest'
    ]

    # Input (concatenate all VOB files)
    cmd.extend(['-i', f'concat:{input_path}'])

    # Time parameters
    if start_time:
        cmd.extend(['-ss', start_time])
    if duration:
        cmd.extend(['-t', duration])

    # Output settings
    cmd.extend([
        '-c:v', 'libx264',  # Video codec
        '-c:a', 'aac',      # Audio codec
        '-crf', '18',       # High quality
        '-preset', 'medium', # Encoding speed
        output_path
    ])

    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    return True

def analyze_dvd_structure(video_ts_path):
    """Analyze DVD structure to find episodes"""
    vob_files = []

    for file in sorted(os.listdir(video_ts_path)):
        if file.startswith('VTS_01_') and file.endswith('.VOB') and not file.endswith('_0.VOB'):
            vob_files.append(os.path.join(video_ts_path, file))

    # Create concat string for ffmpeg
    concat_string = '|'.join(vob_files)
    return concat_string, len(vob_files)

def extract_episodes_interactive(dvd_path, output_dir):
    """Interactive episode extraction"""

    print(f"Analyzing DVD: {dvd_path}")

    # Find VIDEO_TS directory
    video_ts_path = None
    for root, dirs, files in os.walk(dvd_path):
        if 'VIDEO_TS' in dirs:
            video_ts_path = os.path.join(root, 'VIDEO_TS')
            break

    if not video_ts_path:
        print("No VIDEO_TS directory found!")
        return

    print(f"Found VIDEO_TS: {video_ts_path}")

    # Analyze structure
    concat_string, vob_count = analyze_dvd_structure(video_ts_path)
    print(f"Found {vob_count} VOB files")

    # Get total duration using ffprobe
    probe_cmd = [
        'docker', 'run', '--rm',
        '-v', '/staging-pool:/staging-pool',
        'jrottenberg/ffmpeg:latest',
        '-i', f'concat:{concat_string}',
        '-hide_banner'
    ]

    print("Getting DVD duration...")
    result = subprocess.run(probe_cmd, capture_output=True, text=True)

    # Extract duration from stderr
    duration_line = [line for line in result.stderr.split('\n') if 'Duration:' in line]
    if duration_line:
        print(duration_line[0].strip())

    # Interactive episode extraction
    episode_num = 1

    while True:
        print(f"\n=== Episode {episode_num} ===")
        start_time = input("Start time (HH:MM:SS) or 'q' to quit: ").strip()

        if start_time.lower() == 'q':
            break

        duration = input("Duration (HH:MM:SS) or episode length: ").strip()
        episode_name = input(f"Episode name (default: Episode_{episode_num:02d}): ").strip()

        if not episode_name:
            episode_name = f"Episode_{episode_num:02d}"

        # Clean filename
        episode_name = "".join(c for c in episode_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        output_file = os.path.join(output_dir, f"{episode_name}.mp4")

        print(f"Extracting: {output_file}")

        success = run_ffmpeg_docker(
            concat_string,
            output_file,
            start_time=start_time,
            duration=duration
        )

        if success:
            print(f"✅ Successfully extracted: {output_file}")
            episode_num += 1
        else:
            print("❌ Extraction failed")
            retry = input("Retry? (y/n): ").strip().lower()
            if retry != 'y':
                episode_num += 1

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 dvd_extractor.py <dvd_path> <output_directory>")
        print("Example: python3 dvd_extractor.py '/staging-pool/downloads/David The Gnome Collection (1985-1988) The Complete Series (4xDVD9) (NTSC)/DISC_1' '/staging-pool/extracted/david_gnome_s1'")
        sys.exit(1)

    dvd_path = sys.argv[1]
    output_dir = sys.argv[2]

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    print(f"DVD Extractor")
    print(f"Input: {dvd_path}")
    print(f"Output: {output_dir}")
    print("-" * 50)

    extract_episodes_interactive(dvd_path, output_dir)
    print("\nExtraction complete!")

if __name__ == "__main__":
    main()