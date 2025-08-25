#!/usr/bin/env python3
"""
Plex Manual Setup Script
Configures Plex directly through preferences without web interface
"""

import xml.etree.ElementTree as ET
import os
import sys

def create_plex_config():
    """Create basic Plex configuration to bypass setup"""
    
    prefs_path = "/config/Library/Application Support/Plex Media Server/Preferences.xml"
    
    if not os.path.exists(prefs_path):
        print("❌ Preferences file not found")
        return False
    
    try:
        # Parse existing preferences
        tree = ET.parse(prefs_path)
        root = tree.getroot()
        
        # Add essential configuration
        root.set('AcceptedEULA', '1')
        root.set('PublishServerOnPlexOnlineKey', '1')
        root.set('PlexOnlineHome', '1')
        root.set('allowedNetworks', '192.168.0.0/255.255.255.0,127.0.0.1')
        root.set('LocalNetworkAddresses', '192.168.0.99')
        root.set('customCertificateDomain', 'localhost,192.168.0.99')
        root.set('enableHttps', '0')
        root.set('secureConnections', '0') 
        root.set('treatWanIpAsLocal', '1')
        root.set('GdmEnabled', '1')
        root.set('EnableIPv6', '0')
        root.set('FriendlyName', 'Proxmox Media Server')
        
        # Save configuration
        tree.write(prefs_path, encoding='utf-8', xml_declaration=True)
        
        print("✅ Plex configuration updated")
        print("   - EULA accepted")
        print("   - Local network access enabled")  
        print("   - Server publishing enabled")
        
        return True
        
    except Exception as e:
        print(f"❌ Error updating configuration: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Configuring Plex manually...")
    
    if create_plex_config():
        print("✅ Manual configuration complete")
        print("🔄 Restart Plex container to apply changes")
    else:
        print("❌ Manual configuration failed")
        sys.exit(1)