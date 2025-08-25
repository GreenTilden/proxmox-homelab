#!/usr/bin/env python3
"""
Plex Authorization Fix Script
Modifies Plex Preferences.xml to enable local network access and complete setup
"""

import xml.etree.ElementTree as ET
import sys
import os

def fix_plex_preferences(preferences_path):
    """
    Fix Plex preferences to allow local network access
    """
    try:
        # Parse the existing XML
        tree = ET.parse(preferences_path)
        root = tree.getroot()
        
        # The root element IS the Preferences element
        if root.tag != 'Preferences':
            print("Error: Root element is not Preferences")
            return False
        
        prefs = root
        
        # Set local network access attributes
        prefs.set('allowedNetworks', '192.168.0.0/255.255.255.0,127.0.0.1')
        prefs.set('customCertificateDomain', '192.168.0.99')
        prefs.set('enableHttps', '0')  # Disable HTTPS for local access
        prefs.set('secureConnections', '0')  # Allow insecure connections locally
        prefs.set('treatWanIpAsLocal', '1')  # Treat WAN IP as local
        
        # Disable first time setup if it exists
        if 'FirstRun' in prefs.attrib:
            prefs.set('FirstRun', '0')
        
        # Set friendly name
        prefs.set('FriendlyName', 'Proxmox Media Server')
        
        # Save the modified XML
        tree.write(preferences_path, encoding='utf-8', xml_declaration=True)
        
        print("✅ Plex preferences updated successfully")
        print(f"   - Local network access: 192.168.0.0/24")
        print(f"   - Custom domain: 192.168.0.99")
        print(f"   - HTTPS disabled for local access")
        print(f"   - Server name: Proxmox Media Server")
        
        return True
        
    except ET.ParseError as e:
        print(f"❌ XML parsing error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error updating preferences: {e}")
        return False

def main():
    preferences_path = "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml"
    
    if not os.path.exists(preferences_path):
        print(f"❌ Preferences file not found: {preferences_path}")
        sys.exit(1)
    
    print("🔧 Fixing Plex local network access...")
    
    if fix_plex_preferences(preferences_path):
        print("✅ Plex authorization fix complete!")
        sys.exit(0)
    else:
        print("❌ Failed to fix Plex preferences")
        sys.exit(1)

if __name__ == "__main__":
    main()