# Quick Start Guide — GitHub Desktop Setup

This guide walks you through setting up and uploading SIREN to GitHub using **GitHub Desktop** on Windows.

---

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/) installed on Windows
- [GitHub Desktop](https://desktop.github.com/) installed and signed in to your GitHub account
- A text editor (VS Code recommended)

---

## Step 1: Download the Project

1. Download the SIREN project folder to your computer (e.g., `C:\Users\YourName\Projects\SIREN`)
2. Make sure the folder structure looks like this:

```
SIREN/
├── app.py
├── requirements.txt
├── README.md
├── SECURITY.md
├── QUICKSTART.md
├── LICENSE
├── .gitignore
├── src/
│   ├── __init__.py
│   ├── report_engine.py
│   └── report_exporter.py
├── templates/
│   └── index.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── samples/
    └── sample_qakbot_incident.json
```

---

## Step 2: Test the App Locally

Open **Command Prompt** or **PowerShell** and run:

```bash
# Navigate to the project folder
cd C:\Users\YourName\Projects\SIREN

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

Open your browser and go to **http://127.0.0.1:5000** — you should see the SIREN interface.

Press `Ctrl+C` in the terminal to stop the server when done testing.

---

## Step 3: Create the GitHub Repository

1. Open your browser and go to **https://github.com/new**
2. Fill in the details:
   - **Repository name:** `SIREN`
   - **Description:** `Security Incident Response Engine & Notation — Professional incident report generator following NIST 800-61 framework`
   - **Visibility:** Public
   - **DO NOT** check "Add a README file" (we already have one)
   - **DO NOT** check "Add .gitignore" (we already have one)
   - **DO NOT** choose a license (we already have one)
3. Click **Create repository**
4. Leave the page open — you'll need the repo URL

---

## Step 4: Upload with GitHub Desktop

### Option A: Add Existing Repository

1. Open **GitHub Desktop**
2. Click **File** → **Add Local Repository**
3. Browse to your SIREN folder (e.g., `C:\Users\YourName\Projects\SIREN`)
4. GitHub Desktop will say "This directory does not appear to be a Git repository"
5. Click **create a repository** (the link in the message)
6. Fill in:
   - **Name:** SIREN
   - **Local Path:** should already be correct
   - Leave all checkboxes unchecked (we have our own files)
7. Click **Create Repository**

### Option B: Create New Repository (Alternative)

1. Open **GitHub Desktop**
2. Click **File** → **New Repository**
3. Fill in:
   - **Name:** SIREN
   - **Local Path:** Browse to the PARENT folder of SIREN (e.g., `C:\Users\YourName\Projects`)
   - **Description:** `Security Incident Response Engine & Notation`
   - Leave all checkboxes unchecked
4. Click **Create Repository**
5. Copy all SIREN project files into the new folder if they're not already there

---

## Step 5: Commit Your Files

1. In GitHub Desktop, you should see all your files listed under **Changes** on the left
2. Make sure all files are checked (they should be by default)
3. At the bottom left, type a commit message:
   - **Summary:** `Initial commit: SIREN v1.0.0`
   - **Description:** `Professional incident report generator following NIST 800-61 framework. Features dark SOC-friendly UI, timeline tracking, IOC management, severity scoring, and Markdown/JSON export.`
4. Click **Commit to main**

---

## Step 6: Publish to GitHub

1. After committing, click the **Publish repository** button at the top
2. In the dialog:
   - **Name:** SIREN
   - **Description:** should auto-fill
   - **Keep this code private:** UNCHECK this (make it public for your portfolio)
   - **Organization:** None (your personal account)
3. Click **Publish Repository**

---

## Step 7: Verify on GitHub

1. Go to **https://github.com/Rootless-Ghost/SIREN**
2. Verify all files are present
3. Check that the README renders correctly on the main page
4. Add relevant **topics** to your repo by clicking the gear icon next to "About":
   - `python`, `flask`, `cybersecurity`, `incident-response`, `nist-800-61`, `soc`, `security-tools`

---

## Making Future Changes

Whenever you modify files in the SIREN folder:

1. Open **GitHub Desktop** — it will automatically detect changes
2. Review the changed files in the **Changes** tab
3. Write a descriptive commit message (e.g., `Add PDF export feature`)
4. Click **Commit to main**
5. Click **Push origin** at the top to upload changes to GitHub

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Python not found" | Make sure Python is added to your PATH during installation |
| App won't start | Check that you activated the virtual environment (`venv\Scripts\activate`) |
| GitHub Desktop can't find repo | Make sure you're pointing to the folder that contains `app.py` |
| Files not showing in Changes | Make sure files are saved and not listed in `.gitignore` |
| Push rejected | Click **Fetch origin** first, then try pushing again |

---

That's it! Your SIREN project is now live on GitHub. 🎯
