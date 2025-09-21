#!/usr/bin/env python3
"""
Iconscout Icon Downloader
Reads CSV export from bookmarklet and downloads icons automatically
"""

import csv
import requests
import os
import re
from urllib.parse import urljoin, urlparse
from pathlib import Path
import time

def clean_filename(filename):
    """Clean filename for filesystem compatibility"""
    # Remove problematic characters
    cleaned = re.sub(r'[^\w\-_.]', '', filename)
    # Limit length
    return cleaned[:50]

def download_icon(url, filename, category, session):
    """Download icon from Iconscout URL"""
    try:
        print(f"📥 Downloading: {filename}")
        
        # Get the icon page
        response = session.get(url)
        if response.status_code != 200:
            print(f"❌ Failed to access page: {url}")
            return False
            
        # Look for download links in the page content
        # This is a simplified approach - Iconscout may require login/API
        page_content = response.text
        
        # Try to find SVG download link patterns
        svg_patterns = [
            r'href="([^"]*\.svg[^"]*)"',
            r'download-url="([^"]*\.svg[^"]*)"',
            r'data-download="([^"]*\.svg[^"]*)"'
        ]
        
        download_url = None
        for pattern in svg_patterns:
            matches = re.findall(pattern, page_content)
            if matches:
                download_url = matches[0]
                break
                
        if not download_url:
            print(f"⚠️  Could not find direct download link for {filename}")
            print(f"   Manual download needed: {url}")
            return False
            
        # Make download URL absolute
        if not download_url.startswith('http'):
            download_url = urljoin(url, download_url)
            
        # Download the actual icon
        icon_response = session.get(download_url)
        if icon_response.status_code != 200:
            print(f"❌ Failed to download icon: {download_url}")
            return False
            
        # Save the file
        category_dir = Path(f"homelab-icons/{category}")
        category_dir.mkdir(parents=True, exist_ok=True)
        
        final_filename = f"{category}-{clean_filename(filename)}.svg"
        file_path = category_dir / final_filename
        
        with open(file_path, 'wb') as f:
            f.write(icon_response.content)
            
        print(f"✅ Saved: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error downloading {filename}: {str(e)}")
        return False

def main():
    """Main download process"""
    
    # Check if CSV file exists
    csv_file = input("Enter path to your iconscout-download-log.csv file: ").strip()
    if not os.path.exists(csv_file):
        print(f"❌ CSV file not found: {csv_file}")
        return
        
    # Create session with headers to mimic browser
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    print("🎮 Iconscout Icon Downloader Starting...")
    print("📂 Creating directory structure...")
    
    # Create base directory
    Path("homelab-icons").mkdir(exist_ok=True)
    
    # Read CSV and download icons
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        total_icons = 0
        successful_downloads = 0
        failed_downloads = []
        
        for row in reader:
            total_icons += 1
            filename = row['Filename']
            category = row['Category']
            url = row['URL']
            
            print(f"\n--- Processing {total_icons}: {filename} ---")
            
            if download_icon(url, filename, category, session):
                successful_downloads += 1
            else:
                failed_downloads.append((filename, url))
                
            # Be nice to Iconscout servers
            time.sleep(2)
            
    # Summary
    print(f"\n🎯 Download Summary:")
    print(f"   Total icons: {total_icons}")
    print(f"   ✅ Successful: {successful_downloads}")
    print(f"   ❌ Failed: {len(failed_downloads)}")
    
    if failed_downloads:
        print(f"\n⚠️  Manual download needed for:")
        for filename, url in failed_downloads:
            print(f"   - {filename}: {url}")
            
    print(f"\n📁 Icons saved to: ./homelab-icons/")
    print(f"   Ready to upload with: scp -r homelab-icons/* root@192.168.0.99:/service-pool/homer-assets/icons/")

if __name__ == "__main__":
    main()