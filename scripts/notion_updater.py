import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Notion API key and page ID from environment variables
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_PAGE_ID = os.getenv("NOTION_PAGE_ID")
NOTION_API_VERSION = "2022-06-28"  # A recent, stable Notion API version

def append_to_notion_page(page_id, api_key, content):
    """
    Appends a new markdown block to the specified Notion page.
    """
    if not page_id or not api_key:
        print("Error: NOTION_PAGE_ID and NOTION_API_KEY must be set in the .env file.")
        sys.exit(1)

    url = f"https://api.notion.com/v1/blocks/{page_id}/children"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Notion-Version": NOTION_API_VERSION
    }

    # Notion's API expects content to be broken down into blocks.
    # We will create a single "code" block to contain the markdown report.
    # This preserves formatting well.
    new_block_data = {
        "children": [
            {
                "object": "block",
                "type": "code",
                "code": {
                    "rich_text": [{
                        "type": "text",
                        "text": {
                            "content": content
                        }
                    }],
                    "language": "markdown"
                }
            }
        ]
    }

    try:
        response = requests.patch(url, headers=headers, data=json.dumps(new_block_data))
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        print("Successfully appended content to Notion page.")
    except requests.exceptions.RequestException as e:
        print(f"Error appending to Notion page: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response Body: {e.response.text}")
        sys.exit(1)

if __name__ == "__main__":
    # The content to append is passed as a command-line argument.
    if len(sys.argv) < 2:
        print("Usage: python notion_updater.py \"<markdown_content>\"")
        sys.exit(1)

    markdown_content = sys.argv[1]
    append_to_notion_page(NOTION_PAGE_ID, NOTION_API_KEY, markdown_content)
