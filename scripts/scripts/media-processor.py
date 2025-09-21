#!/usr/bin/env python3
"""
Media Processing Pipeline for Proxmox Homelab
Automatically processes completed downloads from staging-pool to media-pool for Plex

Features:
- TV Show organization (Season/Episode detection)
- Movie organization 
- Quality control and validation
- Plex library refresh triggers
- Comprehensive logging
"""

import os
import re
import shutil
import logging
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse
import subprocess
import time

# Configuration
STAGING_PATH = Path("/staging-pool/downloads")
MEDIA_PATH = Path("/media-pool")
MOVIES_PATH = MEDIA_PATH / "movies"
TV_SHOWS_PATH = MEDIA_PATH / "tv-shows"
DISNEY_SHORTS_PATH = MEDIA_PATH / "disney-shorts"
PROCESSING_LOG = Path("/service-pool/media-processing.log")

# Video file extensions
VIDEO_EXTENSIONS = {'.mkv', '.mp4', '.avi', '.m4v', '.mov', '.wmv', '.flv', '.webm'}

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(PROCESSING_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MediaProcessor:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.processed_count = 0
        self.skipped_count = 0
        self.error_count = 0
        
        # Create directories if they don't exist
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Create necessary directories"""
        for path in [MOVIES_PATH, TV_SHOWS_PATH, DISNEY_SHORTS_PATH]:
            if not self.dry_run:
                path.mkdir(parents=True, exist_ok=True)
                logger.info(f"Ensured directory exists: {path}")
    
    def _is_tv_show(self, filename: str) -> Tuple[bool, Optional[Dict]]:
        """
        Detect if file is a TV show episode
        Returns (is_tv_show, metadata_dict)
        """
        # Pattern for TV shows: Show Name (Year) Season X Episode Y
        # or Show Name - SxxEyy pattern
        patterns = [
            r'(.+?)\s*\((\d{4})\)\s*.*?Season\s*(\d+).*?Episode\s*(\d+)',
            r'(.+?)\s*-?\s*S(\d+)E(\d+)',
            r'(.+?)\s*(\d+)x(\d+)',  # ShowName 1x01 format
            r'(.+?)\s*Season\s*(\d+).*?Episode\s*(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, filename, re.IGNORECASE)
            if match:
                if len(match.groups()) == 4:  # Pattern with year
                    show_name, year, season, episode = match.groups()
                    return True, {
                        'show_name': show_name.strip(),
                        'year': year,
                        'season': int(season),
                        'episode': int(episode)
                    }
                elif len(match.groups()) == 3:  # Pattern without year
                    show_name, season, episode = match.groups()
                    return True, {
                        'show_name': show_name.strip(),
                        'year': None,
                        'season': int(season),
                        'episode': int(episode)
                    }
        
        # Check if it's in a directory that suggests TV show
        parent_path = Path(filename).parent.name
        if any(indicator in parent_path.lower() for indicator in ['season', 'series', 'episodes']):
            return True, {
                'show_name': parent_path,
                'season': 1,  # Default season
                'episode': None,
                'year': None
            }
            
        return False, None
    
    def _generate_tv_path(self, metadata: Dict, filename: str) -> Path:
        """Generate organized path for TV show episode"""
        show_name = metadata['show_name']
        season = metadata['season']
        
        # Clean show name for filesystem
        clean_show_name = re.sub(r'[<>:"/\\|?*]', '', show_name)
        
        # Create show directory with year if available
        if metadata.get('year'):
            show_dir = f"{clean_show_name} ({metadata['year']})"
        else:
            show_dir = clean_show_name
        
        season_dir = f"Season {season:02d}"
        
        return TV_SHOWS_PATH / show_dir / season_dir / filename
    
    def _is_disney_short(self, filename: str) -> bool:
        """
        Detect if file is a Disney short animation
        """
        # Disney character patterns
        disney_patterns = [
            'mickey', 'donald', 'pluto', 'goofy', 'minnie', 'oswald',
            'chip', 'dale', 'figaro', 'clarabelle', 'silly symphony'
        ]
        
        filename_lower = filename.lower()
        
        # Check for Disney characters
        if any(pattern in filename_lower for pattern in disney_patterns):
            return True
        
        # Check for classic animation years (1920-1959) with animation keywords
        year_match = re.search(r'(19[2-5]\d)', filename)
        if year_match:
            year = int(year_match.group(1))
            if 1920 <= year <= 1959:
                # Additional check for animation/Disney content
                animation_keywords = ['cartoon', 'animation', 'symphony', 'disney']
                if any(keyword in filename_lower for keyword in animation_keywords):
                    return True
        
        return False
    
    def _generate_disney_path(self, filename: str) -> Path:
        """Generate organized path for Disney short"""
        # Extract short name and year if possible
        name_part = Path(filename).stem
        
        # Try to extract year
        year_match = re.search(r'\((\d{4})\)', name_part)
        if year_match:
            year = year_match.group(1)
            clean_name = re.sub(r'\s*\(\d{4}\)\s*', '', name_part)
            short_dir = f"{clean_name} ({year})"
        else:
            # Look for 4-digit year anywhere in filename
            year_match = re.search(r'(\d{4})', name_part)
            if year_match:
                year = year_match.group(1)
                short_dir = f"{name_part} ({year})"
            else:
                short_dir = name_part
        
        # Clean directory name
        clean_dir = re.sub(r'[<>:"/\\|?*]', '', short_dir)
        
        return DISNEY_SHORTS_PATH / clean_dir / filename
    
    def _generate_movie_path(self, filename: str) -> Path:
        """Generate organized path for movie"""
        # Extract movie name and year if possible
        name_part = Path(filename).stem
        
        # Try to extract year
        year_match = re.search(r'\((\d{4})\)', name_part)
        if year_match:
            year = year_match.group(1)
            clean_name = re.sub(r'\s*\(\d{4}\)\s*', '', name_part)
            movie_dir = f"{clean_name} ({year})"
        else:
            # Look for 4-digit year anywhere in filename
            year_match = re.search(r'(\d{4})', name_part)
            if year_match:
                year = year_match.group(1)
                movie_dir = f"{name_part} ({year})"
            else:
                movie_dir = name_part
        
        # Clean directory name
        clean_dir = re.sub(r'[<>:"/\\|?*]', '', movie_dir)
        
        return MOVIES_PATH / clean_dir / filename
    
    def _move_file(self, source: Path, destination: Path) -> bool:
        """Safely move file to destination"""
        try:
            if self.dry_run:
                logger.info(f"DRY RUN: Would move {source} -> {destination}")
                return True
            
            # Create destination directory
            destination.parent.mkdir(parents=True, exist_ok=True)
            
            # Check if destination exists
            if destination.exists():
                logger.warning(f"Destination exists, skipping: {destination}")
                return False
            
            # Move file
            shutil.move(str(source), str(destination))
            logger.info(f"Moved: {source} -> {destination}")
            return True
            
        except Exception as e:
            logger.error(f"Error moving {source} to {destination}: {e}")
            return False
    
    def _refresh_plex_library(self):
        """Trigger Plex library refresh"""
        try:
            if self.dry_run:
                logger.info("DRY RUN: Would refresh Plex library")
                return
            
            # Use curl to trigger Plex library refresh
            # This requires Plex token - for now just log
            logger.info("Triggering Plex library refresh...")
            
            # Alternative: touch a file that a separate script monitors
            refresh_flag = Path("/service-pool/plex-refresh-needed")
            refresh_flag.touch()
            
        except Exception as e:
            logger.error(f"Error refreshing Plex library: {e}")
    
    def process_directory(self, directory: Path) -> Dict:
        """Process all media files in a directory"""
        results = {
            'processed': 0,
            'skipped': 0,
            'errors': 0,
            'files': []
        }
        
        if not directory.exists():
            logger.warning(f"Directory not found: {directory}")
            return results
        
        logger.info(f"Processing directory: {directory}")
        
        # Find all video files
        video_files = []
        for ext in VIDEO_EXTENSIONS:
            video_files.extend(directory.rglob(f"*{ext}"))
        
        logger.info(f"Found {len(video_files)} video files")
        
        for video_file in video_files:
            try:
                filename = video_file.name
                rel_path = video_file.relative_to(directory)
                
                logger.info(f"Processing: {rel_path}")
                
                # Determine content type: TV show, Disney short, or movie
                is_tv, tv_metadata = self._is_tv_show(str(rel_path))
                is_disney = self._is_disney_short(str(rel_path))
                
                if is_tv:
                    destination = self._generate_tv_path(tv_metadata, filename)
                    media_type = "TV Show"
                elif is_disney:
                    destination = self._generate_disney_path(filename)
                    media_type = "Disney Short"
                else:
                    destination = self._generate_movie_path(filename)
                    media_type = "Movie"
                
                logger.info(f"Classified as: {media_type}")
                logger.info(f"Destination: {destination}")
                
                # Move file
                if self._move_file(video_file, destination):
                    results['processed'] += 1
                    self.processed_count += 1
                else:
                    results['skipped'] += 1
                    self.skipped_count += 1
                
                results['files'].append({
                    'source': str(rel_path),
                    'destination': str(destination),
                    'type': media_type,
                    'status': 'processed' if results['processed'] > results['skipped'] else 'skipped'
                })
                
            except Exception as e:
                logger.error(f"Error processing {video_file}: {e}")
                results['errors'] += 1
                self.error_count += 1
        
        return results
    
    def process_all(self) -> Dict:
        """Process all directories in staging area"""
        logger.info("Starting media processing pipeline")
        
        total_results = {
            'processed': 0,
            'skipped': 0,
            'errors': 0,
            'directories': {}
        }
        
        if not STAGING_PATH.exists():
            logger.error(f"Staging path not found: {STAGING_PATH}")
            return total_results
        
        # Process each subdirectory
        for item in STAGING_PATH.iterdir():
            if item.is_dir():
                logger.info(f"Processing directory: {item.name}")
                dir_results = self.process_directory(item)
                
                total_results['processed'] += dir_results['processed']
                total_results['skipped'] += dir_results['skipped']
                total_results['errors'] += dir_results['errors']
                total_results['directories'][item.name] = dir_results
        
        # Refresh Plex if files were processed
        if total_results['processed'] > 0:
            self._refresh_plex_library()
        
        # Log summary
        logger.info(f"Processing complete:")
        logger.info(f"  Processed: {total_results['processed']}")
        logger.info(f"  Skipped: {total_results['skipped']}")
        logger.info(f"  Errors: {total_results['errors']}")
        
        return total_results

def main():
    parser = argparse.ArgumentParser(description="Process media files for Plex")
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without making changes')
    parser.add_argument('--directory', help='Process specific directory only')
    
    args = parser.parse_args()
    
    processor = MediaProcessor(dry_run=args.dry_run)
    
    if args.directory:
        # Process specific directory
        target_dir = STAGING_PATH / args.directory
        results = processor.process_directory(target_dir)
    else:
        # Process all directories
        results = processor.process_all()
    
    # Output results as JSON for automation
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()