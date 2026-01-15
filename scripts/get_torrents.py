import qbittorrentapi

# Default qBittorrent Web UI credentials and host
HOST = 'localhost'
PORT = 8112
USERNAME = 'admin'
PASSWORD = 'adminadmin'

def get_stuck_torrents():
    try:
        qbt_client = qbittorrentapi.Client(
            host=HOST,
            port=PORT,
            username=USERNAME,
            password=PASSWORD
        )

        # Attempt to login
        qbt_client.auth_log_in()
        print(f"Successfully connected to qBittorrent API at {HOST}:{PORT}")

        # Get torrents
        torrents = qbt_client.torrents_info()

        if not torrents:
            print("No torrents found.")
            return

        print("\n--- All Torrents ---")
        for torrent in torrents:
            progress_percent = torrent.progress * 100
            print(f"Name: {torrent.name}")
            print(f"  Progress: {progress_percent:.2f}%")
            print(f"  State: {torrent.state}")
            print(f"  ETA: {torrent.eta} seconds")
            print(f"  Ratio: {torrent.ratio:.2f}")
            print(f"  Download Speed: {torrent.dlspeed / 1024:.2f} KB/s")
            print(f"  Upload Speed: {torrent.upspeed / 1024:.2f} KB/s")
            print("-" * 30)

        # Identify torrents stuck at 99%
        print("\n--- Torrents potentially stuck at 99% ---")
        stuck_torrents = [
            t for t in torrents
            if 99.0 <= (t.progress * 100) < 100.0 and t.state == 'downloading'
        ]

        if not stuck_torrents:
            print("No torrents found stuck at 99%.")
            return

        for torrent in stuck_torrents:
            print(f"Name: {torrent.name}")
            print(f"  Progress: {torrent.progress * 100:.2f}%")
            print(f"  State: {torrent.state}")
            print(f"  ETA: {torrent.eta} seconds")
            print("-" * 30)

    except qbittorrentapi.exceptions.APIError as e:
        print(f"qBittorrent API Error: {e}")
        if "Unauthorized" in str(e):
            print("Authentication failed. Please check your username and password.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    get_stuck_torrents()
