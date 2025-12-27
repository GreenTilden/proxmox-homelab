# Notion Integration (Gemini-Assisted)

## Overview
This project now leverages a custom Python script (`notion_updater.py`) to append content to your Notion pages. This allows the Gemini AI assistant to record session summaries, task updates, and debug logs directly into your Notion workspace in a structured and secure manner.

## Setup

### 1. Create Notion Integration & Get API Key
*   Go to [Notion Integrations](https://www.notion.so/my-integrations).
*   Create a new integration (e.g., "Gemini Homelab Updater") and copy the **"Internal Integration Token"** (your Notion API Key).
*   **Security Warning**: Never share this key publicly or commit it to version control.

### 2. Share Notion Page with Integration
*   Go to your Notion page (e.g., "LCiBot Notes").
*   Click the `•••` menu in the top-right corner.
*   Click "**Add connections**" and select the integration you just created.

### 3. Configure `.env` File
*   Create a file named `.env` in the root directory of this project.
*   Add your Notion API Key and the ID of your target Notion Page to this file:
    ```
    NOTION_API_KEY="secret_your_api_key_here"
    NOTION_PAGE_ID="your_notion_page_id_here"
    ```
*   **Important**: The `.env` file is already added to `.gitignore` to prevent accidental commits.

### 4. Install Dependencies
*   Ensure Python is installed.
*   Install the required Python libraries:
    ```bash
    pip install requests python-dotenv
    ```

## Usage

The `notion_updater.py` script is located in the `scripts/` directory. It takes the content to be appended as a command-line argument.

### Appending Content
To append markdown content to your configured Notion page, run the script from the project root:

```bash
python scripts/notion_updater.py "## Session Summary\n- Task: Updated X\n- Status: Complete"
```

*   Ensure the content is enclosed in double quotes.
*   Use `\n` for newlines within the string.
*   The content will be added as a Notion "code" block with `markdown` language to preserve formatting.

### Example (from Gemini Assistant)
At the end of a session, the Gemini assistant might generate a summary like this:

```python
# python scripts/notion_updater.py "# Feature Update: Notion Integration\n\n- **Status:** Complete\n- **Details:** Built a Python script to append markdown to Notion."
```

This will create a new entry on your Notion page.
