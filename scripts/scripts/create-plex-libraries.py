#!/usr/bin/env python3
"""
Plex Library Creation Script
Creates three separate libraries via Plex API with proper organization
"""

import requests
import json
import sys
import time
import urllib.parse

# Configuration
PLEX_SERVER = "http://localhost:32400"
SERVER_TOKEN = "TEx39bYf-78Ag9MPqb88"

# Library configurations
LIBRARIES = [
    {
        'name': 'Movies',
        'type': 'movie',
        'agent': 'com.plexapp.agents.imdb',
        'scanner': 'Plex Movie',
        'path': '/media/movies',
        'language': 'en'
    },
    {
        'name': 'TV Shows', 
        'type': 'show',
        'agent': 'com.plexapp.agents.thetvdb',
        'scanner': 'Plex TV Series',
        'path': '/media/tv-shows',
        'language': 'en'
    },
    {
        'name': 'Disney Shorts',
        'type': 'movie',  # Disney shorts are movies but in separate library
        'agent': 'com.plexapp.agents.imdb',
        'scanner': 'Plex Movie',
        'path': '/media/disney-shorts',
        'language': 'en'
    }
]

def make_plex_request(endpoint, method='GET', params=None, data=None):
    """Make authenticated request to Plex API"""
    headers = {
        'X-Plex-Token': SERVER_TOKEN,
        'Accept': 'application/json'
    }
    
    if params is None:
        params = {}
    
    params['X-Plex-Token'] = SERVER_TOKEN
    
    url = f"{PLEX_SERVER}{endpoint}"
    
    try:
        if method == 'POST':
            response = requests.post(url, headers=headers, params=params, data=data, timeout=30)
        else:
            response = requests.get(url, headers=headers, params=params, timeout=30)
        
        response.raise_for_status()
        return response
        
    except requests.exceptions.RequestException as e:
        print(f"❌ API request failed: {e}")
        return None

def check_existing_libraries():
    """Check what libraries already exist"""
    print("🔍 Checking existing libraries...")
    
    response = make_plex_request('/library/sections')
    if not response:
        return []
    
    try:
        data = response.json()
        libraries = []
        
        if 'MediaContainer' in data and 'Directory' in data['MediaContainer']:
            for lib in data['MediaContainer']['Directory']:
                libraries.append({
                    'key': lib['key'],
                    'title': lib['title'], 
                    'type': lib['type']
                })
                print(f"   Found: {lib['title']} ({lib['type']})")
        
        return libraries
        
    except json.JSONDecodeError:
        print("❌ Failed to parse library response")
        return []

def create_library(lib_config):
    """Create a single library"""
    print(f"📚 Creating library: {lib_config['name']}")
    
    # Prepare library creation parameters
    params = {
        'name': lib_config['name'],
        'type': lib_config['type'],
        'agent': lib_config['agent'],
        'scanner': lib_config['scanner'],
        'language': lib_config['language'],
        'location': lib_config['path']
    }
    
    response = make_plex_request('/library/sections', method='POST', params=params)
    
    if response and response.status_code in [200, 201]:
        print(f"   ✅ Created: {lib_config['name']}")
        return True
    else:
        print(f"   ❌ Failed to create: {lib_config['name']}")
        if response:
            print(f"      Status: {response.status_code}")
        return False

def refresh_library(library_key):
    """Refresh/scan a library"""
    print(f"🔄 Refreshing library {library_key}...")
    
    response = make_plex_request(f'/library/sections/{library_key}/refresh')
    
    if response and response.status_code == 200:
        print(f"   ✅ Library refresh started")
        return True
    else:
        print(f"   ❌ Failed to refresh library")
        return False

def main():
    print("🎬 Starting Plex library creation...")
    
    # Check server connectivity
    response = make_plex_request('/')
    if not response:
        print("❌ Cannot connect to Plex server")
        sys.exit(1)
    
    print("✅ Connected to Plex server")
    
    # Check existing libraries
    existing_libs = check_existing_libraries()
    existing_names = [lib['title'] for lib in existing_libs]
    
    # Create new libraries
    created_count = 0
    library_keys = []
    
    for lib_config in LIBRARIES:
        if lib_config['name'] in existing_names:
            print(f"⏭️  Library '{lib_config['name']}' already exists, skipping...")
            # Find the key for existing library
            for lib in existing_libs:
                if lib['title'] == lib_config['name']:
                    library_keys.append(lib['key'])
                    break
        else:
            if create_library(lib_config):
                created_count += 1
                # Get the library key for the new library
                updated_libs = check_existing_libraries()
                for lib in updated_libs:
                    if lib['title'] == lib_config['name']:
                        library_keys.append(lib['key'])
                        break
        
        # Small delay between creations
        time.sleep(2)
    
    print(f"\n📊 Library creation summary:")
    print(f"   Created: {created_count} new libraries")
    print(f"   Total: {len(LIBRARIES)} libraries configured")
    
    # Trigger refreshes for all libraries
    print(f"\n🔄 Starting library scans...")
    for key in library_keys:
        refresh_library(key)
        time.sleep(1)
    
    print(f"\n🎉 Plex library setup complete!")
    print(f"📚 Libraries available:")
    for lib in LIBRARIES:
        print(f"   - {lib['name']}: {lib['path']}")
    
    print(f"\n🌐 Access your Plex server at: http://192.168.0.99:32400")

if __name__ == "__main__":
    main()