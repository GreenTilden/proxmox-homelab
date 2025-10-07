#!/usr/bin/env python3
"""
DVD Batch Extractor
Extracts episodes from DVD with predefined time segments
"""

import os
import subprocess
import sys
from pathlib import Path

def run_ffmpeg_docker(input_path, output_path, start_time=None, duration=None):
    """Run ffmpeg via Docker container"""
    cmd = [
        'docker', 'run', '--rm',
        '-v', '/staging-pool:/staging-pool',
        '-v', '/media-pool:/media-pool',
        'jrottenberg/ffmpeg:latest'
    ]

    cmd.extend(['-i', f'concat:{input_path}'])

    if start_time:
        cmd.extend(['-ss', start_time])
    if duration:
        cmd.extend(['-t', duration])

    cmd.extend([
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-crf', '18',
        '-preset', 'medium',
        output_path
    ])

    print(f"Extracting: {os.path.basename(output_path)}")
    print(f"Time: {start_time} -> {duration}")

    result = subprocess.run(cmd, capture_output=False, text=True)
    return result.returncode == 0

def analyze_dvd_structure(video_ts_path):
    """Analyze DVD structure to find episodes"""
    vob_files = []
    for file in sorted(os.listdir(video_ts_path)):
        if file.startswith('VTS_01_') and file.endswith('.VOB') and not file.endswith('_0.VOB'):
            vob_files.append(os.path.join(video_ts_path, file))

    return '|'.join(vob_files), len(vob_files)

def get_duration(concat_string):
    """Get total duration of DVD"""
    probe_cmd = [
        'docker', 'run', '--rm',
        '-v', '/staging-pool:/staging-pool',
        'jrottenberg/ffmpeg:latest',
        '-i', f'concat:{concat_string}',
        '-hide_banner'
    ]

    result = subprocess.run(probe_cmd, capture_output=True, text=True)

    for line in result.stderr.split('\n'):
        if 'Duration:' in line:
            duration_part = line.split('Duration: ')[1].split(',')[0]
            return duration_part
    return None

def extract_episodes_batch(dvd_path, output_dir, episode_config):
    """Batch extract episodes based on config"""

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

    # Get duration
    total_duration = get_duration(concat_string)
    print(f"Total duration: {total_duration}")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Extract episodes
    for episode in episode_config:
        episode_name = episode['name']
        start_time = episode['start']
        duration = episode['duration']

        output_file = os.path.join(output_dir, f"{episode_name}.mp4")

        success = run_ffmpeg_docker(
            concat_string,
            output_file,
            start_time=start_time,
            duration=duration
        )

        if success:
            print(f"✅ {episode_name}")
        else:
            print(f"❌ Failed: {episode_name}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 dvd_batch_extract.py <dvd_path> <output_directory> [episode_length_minutes]")
        print("\nExample (auto-split into 12-minute episodes):")
        print("python3 dvd_batch_extract.py '/staging-pool/downloads/David The Gnome Collection (1985-1988) The Complete Series (4xDVD9) (NTSC)/DISC_1' '/staging-pool/extracted/david_gnome_disc1' 12")
        print("\nExample (extract full disc):")
        print("python3 dvd_batch_extract.py '/staging-pool/downloads/David The Gnome Collection (1985-1988) The Complete Series (4xDVD9) (NTSC)/DISC_1' '/staging-pool/extracted/david_gnome_disc1'")
        sys.exit(1)

    dvd_path = sys.argv[1]
    output_dir = sys.argv[2]

    # Get disc number from path
    disc_num = "Unknown"
    if "DISC_1" in dvd_path:
        disc_num = "1"
    elif "DISC_2" in dvd_path:
        disc_num = "2"
    elif "DISC_3" in dvd_path:
        disc_num = "3"
    elif "DISC_4" in dvd_path:
        disc_num = "4"

    # Default: extract full content or auto-split
    if len(sys.argv) > 3:
        episode_length = int(sys.argv[3])  # minutes
        # Auto-split based on typical episode length
        episode_config = [
            {'name': f'David_The_Gnome_Disc{disc_num}_Episode_01', 'start': '00:00:00', 'duration': f'00:{episode_length:02d}:00'},
            {'name': f'David_The_Gnome_Disc{disc_num}_Episode_02', 'start': f'00:{episode_length:02d}:00', 'duration': f'00:{episode_length:02d}:00'},
        ]
    else:
        # Extract full disc
        episode_config = [
            {'name': f'David_The_Gnome_Disc{disc_num}_Complete', 'start': '00:00:00', 'duration': None},
        ]

    print(f"DVD Batch Extractor")
    print(f"Input: {dvd_path}")
    print(f"Output: {output_dir}")
    print("-" * 50)

    extract_episodes_batch(dvd_path, output_dir, episode_config)
    print("\nExtraction complete!")

if __name__ == "__main__":
    main()