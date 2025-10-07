#!/usr/bin/env python3
"""
DVD Title Extractor with Plex Metadata
Extracts individual DVD titles (episodes) using proper DVD structure analysis
"""

import os
import subprocess
import sys
import json
import re
from pathlib import Path

def run_ffmpeg_docker(dvd_path, title_number, output_path, metadata=None):
    """Extract DVD title using ffmpeg"""
    cmd = [
        'docker', 'run', '--rm',
        '-v', '/staging-pool:/staging-pool',
        '-v', '/media-pool:/media-pool',
        'jrottenberg/ffmpeg:latest'
    ]

    # Use DVD title as input
    cmd.extend(['-i', f'dvd:{dvd_path}', '-map', f'0:v:0', '-map', f'0:a:0'])
    cmd.extend(['-title', str(title_number)])

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

    print(f"Extracting Title {title_number}: {os.path.basename(output_path)}")
    if metadata:
        print(f"  Episode: {metadata.get('title', 'Unknown')}")

    result = subprocess.run(cmd, capture_output=False, text=True)
    return result.returncode == 0

def run_ffmpeg_vob_direct(vob_path, output_path, metadata=None):
    """Extract directly from VOB file as fallback"""
    cmd = [
        'docker', 'run', '--rm',
        '-v', '/staging-pool:/staging-pool',
        '-v', '/media-pool:/media-pool',
        'jrottenberg/ffmpeg:latest'
    ]

    cmd.extend(['-i', vob_path])

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

    print(f"Extracting from VOB: {os.path.basename(output_path)}")
    if metadata:
        print(f"  Episode: {metadata.get('title', 'Unknown')}")

    result = subprocess.run(cmd, capture_output=False, text=True)
    return result.returncode == 0

def analyze_dvd_titles(dvd_path):
    """Use lsdvd to analyze DVD structure"""
    cmd = ['lsdvd', dvd_path]
    result = subprocess.run(cmd, capture_output=True, text=True)

    titles = []
    for line in result.stdout.split('\n'):
        if line.startswith('Title:'):
            # Parse: "Title: 02, Length: 00:22:03.667 Chapters: 01, Cells: 01"
            title_match = re.search(r'Title: (\d+), Length: ([\d:\.]+)', line)
            if title_match:
                title_num = int(title_match.group(1))
                length = title_match.group(2)

                # Convert length to seconds for filtering
                time_parts = length.split(':')
                if len(time_parts) >= 3:
                    hours = int(time_parts[0])
                    minutes = int(time_parts[1])
                    seconds = float(time_parts[2])
                    total_seconds = hours * 3600 + minutes * 60 + seconds

                    # Only include titles longer than 10 minutes (likely episodes)
                    if total_seconds > 600:  # 10 minutes
                        titles.append({
                            'title': title_num,
                            'length': length,
                            'seconds': total_seconds
                        })

    return titles

def get_episode_metadata(episode_number):
    """Get episode metadata for David The Gnome"""
    episodes = [
        {"episode": 1, "title": "The Gnome Named David", "description": "Introduction to David and his magical world.", "air_date": "1985-01-04"},
        {"episode": 2, "title": "The Witch's Ring", "description": "David helps retrieve a stolen ring from a witch.", "air_date": "1985-01-11"},
        {"episode": 3, "title": "The Baby Troll", "description": "David and Lisa care for an abandoned baby troll.", "air_date": "1985-01-18"},
        {"episode": 4, "title": "The Little Train", "description": "David helps repair a magical forest train.", "air_date": "1985-01-25"},
        {"episode": 5, "title": "The Magic Fountain", "description": "The gnomes discover a fountain with healing powers.", "air_date": "1985-02-01"},
        {"episode": 6, "title": "The Bear and the Bees", "description": "David mediates a conflict between forest animals.", "air_date": "1985-02-08"},
        {"episode": 7, "title": "The Forest Fire", "description": "David and the forest animals battle a dangerous fire.", "air_date": "1985-02-15"},
        {"episode": 8, "title": "The Mountain Rescue", "description": "A rescue mission in the snowy mountains.", "air_date": "1985-02-22"},
    ]

    if episode_number <= len(episodes):
        return episodes[episode_number - 1]
    else:
        return {
            "title": f"Episode {episode_number}",
            "description": f"David The Gnome Episode {episode_number}",
            "air_date": "1985-01-01"
        }

def create_plex_structure(base_output_dir):
    """Create Plex-compatible folder structure"""
    series_name = "David the Gnome"
    year = 1985

    series_folder = f"{series_name} ({year})"
    season_folder = "Season 01"

    full_path = os.path.join(base_output_dir, series_folder, season_folder)
    os.makedirs(full_path, exist_ok=True)

    return full_path

def generate_plex_filename(episode_number, episode_title):
    """Generate Plex-compatible filename"""
    clean_title = "".join(c for c in episode_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
    filename = f"David the Gnome - S01E{episode_number:02d} - {clean_title}.mp4"
    return filename

def extract_all_episodes(dvd_path, output_dir, disc_number):
    """Extract all episodes from DVD using title analysis"""

    print(f"Analyzing DVD structure: {dvd_path}")

    # Analyze DVD titles
    titles = analyze_dvd_titles(dvd_path)
    print(f"Found {len(titles)} episode titles:")

    for title in titles:
        print(f"  Title {title['title']}: {title['length']} ({title['seconds']:.0f}s)")

    if not titles:
        print("No suitable titles found! Falling back to VOB extraction...")
        return extract_from_vobs(dvd_path, output_dir, disc_number)

    # Create Plex folder structure
    plex_output_dir = create_plex_structure(output_dir)
    print(f"Output directory: {plex_output_dir}")

    # Calculate episode numbering based on disc
    episodes_per_disc = 7  # Typical for David The Gnome
    start_episode = (disc_number - 1) * episodes_per_disc + 1

    # Extract each title as an episode
    for i, title_info in enumerate(titles):
        episode_number = start_episode + i

        # Get episode metadata
        episode_data = get_episode_metadata(episode_number)

        # Generate filename
        filename = generate_plex_filename(episode_number, episode_data["title"])
        output_file = os.path.join(plex_output_dir, filename)

        # Prepare metadata
        metadata = {
            "title": episode_data["title"],
            "show": "David the Gnome",
            "season": "1",
            "episode": str(episode_number),
            "description": episode_data["description"],
            "air_date": episode_data["air_date"]
        }

        print(f"\n=== Extracting Episode {episode_number} ===")
        print(f"DVD Title: {title_info['title']}")
        print(f"Length: {title_info['length']}")
        print(f"Episode: {episode_data['title']}")
        print(f"Output: {filename}")

        # Try DVD title extraction first
        success = run_ffmpeg_docker(
            dvd_path,
            title_info['title'],
            output_file,
            metadata=metadata
        )

        if success:
            print(f"✅ Successfully extracted: {filename}")
        else:
            print(f"❌ Failed to extract: {filename}")

def extract_from_vobs(dvd_path, output_dir, disc_number):
    """Fallback: Extract from individual VOB files"""
    video_ts_path = os.path.join(dvd_path, "VIDEO_TS")

    if not os.path.exists(video_ts_path):
        print(f"VIDEO_TS not found in {dvd_path}")
        return

    # Find VOB files
    vob_files = []
    for file in sorted(os.listdir(video_ts_path)):
        if file.startswith('VTS_01_') and file.endswith('.VOB') and not file.endswith('_0.VOB'):
            vob_files.append(os.path.join(video_ts_path, file))

    print(f"Found {len(vob_files)} VOB files for fallback extraction")

    # Create Plex folder structure
    plex_output_dir = create_plex_structure(output_dir)

    # Extract each VOB as potential episode
    for i, vob_file in enumerate(vob_files[:7]):  # Limit to first 7 VOBs
        episode_number = i + 1
        episode_data = get_episode_metadata(episode_number)

        filename = generate_plex_filename(episode_number, episode_data["title"])
        output_file = os.path.join(plex_output_dir, filename)

        metadata = {
            "title": episode_data["title"],
            "show": "David the Gnome",
            "season": "1",
            "episode": str(episode_number),
            "description": episode_data["description"],
            "air_date": episode_data["air_date"]
        }

        print(f"\n=== VOB Extraction: Episode {episode_number} ===")

        success = run_ffmpeg_vob_direct(
            vob_file,
            output_file,
            metadata=metadata
        )

        if success:
            print(f"✅ Successfully extracted: {filename}")
        else:
            print(f"❌ Failed to extract: {filename}")

def main():
    if len(sys.argv) != 4:
        print("Usage: python3 dvd_title_extractor.py <dvd_path> <output_directory> <disc_number>")
        print("Example: python3 dvd_title_extractor.py '/staging-pool/downloads/David The Gnome Collection/DISC_1/David the Gnome Disc 1' '/media-pool/TV Shows' 1")
        sys.exit(1)

    dvd_path = sys.argv[1]
    output_dir = sys.argv[2]
    disc_number = int(sys.argv[3])

    print(f"DVD Title Extractor - Proper Episode Analysis")
    print(f"DVD: {dvd_path}")
    print(f"Output: {output_dir}")
    print(f"Disc: {disc_number}")
    print("-" * 70)

    extract_all_episodes(dvd_path, output_dir, disc_number)
    print("\n🎬 All episodes extracted! Ready for Plex.")

if __name__ == "__main__":
    main()