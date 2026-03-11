# Git & Multi-Org Deployment Workflow Guide

This guide explains how to upload your school project code to GitHub/GitLab and then deploy it to your other Salesforce org (`SunilDev`).

## The "Single Source of Truth" Concept

You **do not** need separate folders for each Salesforce org. Here is how it works:

1.  **One Project Folder (`VikasSchool`)**: This local folder contains all your code. It is your "Source of Truth."
2.  **No Duplication**: Whether you are working on `DevOrg1` (Packaging) or `SunilDev` (Production/Test), you use the **same files** in this folder.
3.  **Org Aliases**: You connect this one folder to multiple orgs using different aliases. 
    - When you run a command for `DevOrg1`, the tools "speak" to your packaging org.
    - When you run a command for `SunilDev`, the same tools "speak" to your target org.

---

## Phase 1: Uploading Code to your Existing GitHub

Since you already have an account, follow these steps to connect your project:

### 1. Create a New Repository (Online)
1.  Log in to your **[GitHub](https://github.com/)** account.
2.  Click the **+** icon (top-right) and select **New repository**.
3.  Name it `VikasSchool`.
4.  Set it to **Private**.
5.  Click **Create repository**.
6.  Copy the URL (it looks like `https://github.com/your-username/VikasSchool.git`).

### 2. Connect your Local Folder to that Repository
Open your terminal in the `VikasSchool` folder and run these:

1.  **Add all files**:
    ```bash
    git add .
    ```
2.  **Commit the files**:
    ```bash
    git commit -m "Upload school project source"
    ```
3.  **Link to GitHub**:
    ```bash
    git remote add origin https://github.com/sunilbabusakibanda-ctrl/EduTrack.git
    ```
4.  **Rename branch**:
    ```bash
    git branch -M main
    ```
5.  **Push the code**:
    ```bash
    git push -u origin main
    ```

---

### How to Fix (Aggressive Methods):

**Method 1: Force Username in URL**
Run this command to force Git to ask for the correct account's password:
```bash
git remote set-url origin https://sunilbabusakibanda-ctrl@github.com/sunilbabusakibanda-ctrl/EduTrack.git
```
Then try pushing again:
```bash
git push -u origin main
```

**Method 2: Use a Personal Access Token (The "Nuclear" Option)**
If the login popup still doesn't show up, you can use a Token:
1.  Go to GitHub **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
2.  Generate a new token (select "repo" permissions).
3.  Copy the token.
4.  Run this command (replace `YOUR_TOKEN` with the actual token):
```bash
git remote set-url origin https://sunilbabusakibanda-ctrl:YOUR_TOKEN@github.com/sunilbabusakibanda-ctrl/EduTrack.git
```
5.  `git push -u origin main` (This will work 100% without asking for a password).

---

---

## Phase 2: Deploying to the Target Org (SunilDev)

Once your code is safely in Git, you can push it to your other org (`sunil@devorg.com`).

### 1. Verify Authentication
Ensure you are logged into the target org locally.
```bash
sf org list
```
If `SunilDev` is not in the list, log in:
```bash
sf org login web -a SunilDev
```

### 2. Deploy the Project
To push all code from your local machine (which is now synced with Git) to the target org:
```bash
sf project deploy start -o SunilDev --wait 60
```
> [!TIP]
> Use the `-w 60` flag to wait for the deployment if the org is busy.

---

## Summary of Commands for Future Use

| Task | Command |
| :--- | :--- |
| **Commit Changes** | `git add .` then `git commit -m "Your message"` |
| **Sync with Git** | `git push origin main` |
| **Deploy to Source Org** | `sf project deploy start -o DevOrg1` |
| **Deploy to Target Org** | `sf project deploy start -o SunilDev` |

---
**© 2026 EduTrack Systems Portfolio Support**
