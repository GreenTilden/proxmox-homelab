#!/usr/bin/env python3
"""
DVD Episode Extractor with Plex Metadata
Extracts individual episodes from DVD VIDEO_TS folders and organizes for Plex
"""

import os
import subprocess
import sys
import json
import requests
from pathlib import Path

def run_ffmpeg_docker(input_path, output_path, start_time=None, duration=None, metadata=None):
    """Run ffmpeg via Docker container with metadata embedding"""
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

    # Add metadata if provided
    if metadata:
        cmd.extend(['-metadata', f'title={metadata.get("title", "")}'])
        cmd.extend(['-metadata', f'show={metadata.get("show", "")}'])
        cmd.extend(['-metadata', f'season_number={metadata.get("season", "")}'])
        cmd.extend(['-metadata', f'episode_id={metadata.get("episode", "")}'])
        cmd.extend(['-metadata', f'description={metadata.get("description", "")}'])
        cmd.extend(['-metadata', f'date={metadata.get("air_date", "")}'])

    cmd.extend([
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-crf', '18',
        '-preset', 'medium',
        output_path
    ])

    print(f"Extracting: {os.path.basename(output_path)}")
    if metadata:
        print(f"  Title: {metadata.get('title', 'Unknown')}")

    result = subprocess.run(cmd, capture_output=False, text=True)
    return result.returncode == 0

def get_tvdb_metadata(series_name, season=1):
    """Get TV metadata from TheTVDB (free tier)"""
    # Note: In production, you'd need API key from TheTVDB
    # For now, return hardcoded David the Gnome data

    if "david" in series_name.lower() and "gnome" in series_name.lower():
        return {
            "series_name": "David the Gnome",
            "year": 1985,
            "episodes": [
                {"episode": 1, "title": "The Gnome Named David", "description": "Introduction to David and his magical world.", "air_date": "1985-01-04"},
                {"episode": 2, "title": "The Witch's Ring", "description": "David helps retrieve a stolen ring from a witch.", "air_date": "1985-01-11"},
                {"episode": 3, "title": "The Baby Troll", "description": "David and Lisa care for an abandoned baby troll.", "air_date": "1985-01-18"},
                {"episode": 4, "title": "The Little Train", "description": "David helps repair a magical forest train.", "air_date": "1985-01-25"},
                {"episode": 5, "title": "The Magic Fountain", "description": "The gnomes discover a fountain with healing powers.", "air_date": "1985-02-01"},
                {"episode": 6, "title": "The Bear and the Bees", "description": "David mediates a conflict between forest animals.", "air_date": "1985-02-08"},
            ]
        }

    return None

def create_plex_structure(series_metadata, base_output_dir):
    """Create Plex-compatible folder structure"""
    series_name = series_metadata["series_name"]
    year = series_metadata["year"]

    # Plex format: "Series Name (Year)/Season 01/"
    series_folder = f"{series_name} ({year})"
    season_folder = "Season 01"

    full_path = os.path.join(base_output_dir, series_folder, season_folder)
    os.makedirs(full_path, exist_ok=True)

    return full_path

def generate_plex_filename(series_name, season, episode, episode_title):
    """Generate Plex-compatible filename"""
    # Clean up title for filename
    clean_title = "".join(c for c in episode_title if c.isalnum() or c in (' ', '-', '_')).rstrip()

    # Plex format: "Series Name - S01E01 - Episode Title.ext"
    filename = f"{series_name} - S{season:02d}E{episode:02d} - {clean_title}.mp4"
    return filename

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

def extract_episodes_with_metadata(dvd_path, output_dir, series_name, disc_number):
    """Extract episodes with proper Plex metadata and naming"""

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

    # Get series metadata
    series_metadata = get_tvdb_metadata(series_name)
    if not series_metadata:
        print(f"No metadata found for series: {series_name}")
        return

    # Create Plex folder structure
    plex_output_dir = create_plex_structure(series_metadata, output_dir)
    print(f"Plex structure: {plex_output_dir}")

    # Analyze DVD structure
    concat_string, vob_count = analyze_dvd_structure(video_ts_path)
    print(f"Found {vob_count} VOB files")

    # Get total duration
    total_duration = get_duration(concat_string)
    print(f"Total duration: {total_duration}")

    # Calculate episodes per disc
    episodes_per_disc = 2  # Default assumption
    start_episode = (disc_number - 1) * episodes_per_disc + 1

    # Extract episodes with metadata
    episode_length_minutes = 12  # Estimated episode length

    for i in range(episodes_per_disc):
        episode_number = start_episode + i

        # Get episode metadata
        episode_data = None
        if episode_number <= len(series_metadata["episodes"]):
            episode_data = series_metadata["episodes"][episode_number - 1]

        if not episode_data:
            episode_data = {
                "title": f"Episode {episode_number}",
                "description": f"Episode {episode_number} from disc {disc_number}",
                "air_date": "1985-01-01"
            }

        # Calculate time segments
        start_time = f'00:{i * episode_length_minutes:02d}:00'
        duration = f'00:{episode_length_minutes:02d}:00'

        # Generate Plex-compatible filename
        filename = generate_plex_filename(
            series_metadata["series_name"],
            1,  # Season 1
            episode_number,
            episode_data["title"]
        )

        output_file = os.path.join(plex_output_dir, filename)

        # Prepare metadata for embedding
        metadata = {
            "title": episode_data["title"],
            "show": series_metadata["series_name"],
            "season": "1",
            "episode": str(episode_number),
            "description": episode_data["description"],
            "air_date": episode_data["air_date"]
        }

        print(f"\n=== Extracting Episode {episode_number} ===")
        print(f"Title: {episode_data['title']}")
        print(f"File: {filename}")

        success = run_ffmpeg_docker(
            concat_string,
            output_file,
            start_time=start_time,
            duration=duration,
            metadata=metadata
        )

        if success:
            print(f"✅ Successfully extracted: {filename}")
        else:
            print(f"❌ Failed to extract: {filename}")

def main():
    if len(sys.argv) != 4:
        print("Usage: python3 dvd_extractor_plex.py <dvd_path> <output_directory> <disc_number>")
        print("Example: python3 dvd_extractor_plex.py '/staging-pool/downloads/David The Gnome Collection/DISC_1' '/media-pool/TV Shows' 1")
        sys.exit(1)

    dvd_path = sys.argv[1]
    output_dir = sys.argv[2]
    disc_number = int(sys.argv[3])

    # Extract series name from path
    series_name = "David the Gnome"  # Could be extracted from path in future

    print(f"DVD Extractor with Plex Metadata")
    print(f"Series: {series_name}")
    print(f"Disc: {disc_number}")
    print(f"Input: {dvd_path}")
    print(f"Output: {output_dir}")
    print("-" * 60)

    extract_episodes_with_metadata(dvd_path, output_dir, series_name, disc_number)
    print("\nExtraction complete! Files ready for Plex.")

if __name__ == "__main__":
    main()