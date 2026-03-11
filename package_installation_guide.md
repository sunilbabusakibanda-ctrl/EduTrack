# EduTrack Package Installation & Setup Guide

This guide provides a detailed, step-by-step process for setting up the EduTrack system in your Salesforce organization.

---

## Step 1: Enable Person Accounts

Person Accounts are required for the EduTrack system to manage student records effectively.

1.  Log in to your Salesforce Org as a **System Administrator**.
2.  Go to **Setup** (Gear icon in the top right).
3.  In the Quick Find box, enter **Account Settings** and select it.
4.  Verify if the **Allow Customer Support to enable Person Accounts** checkbox is available. If not, you may need to contact Salesforce Support to enable it.
5.  Once permitted, look for the **Enable Person Accounts** button/section and follow the on-screen prompts to enable them.
    > [!IMPORTANT]
    > Once Person Accounts are enabled, they cannot be disabled. Ensure you are enabling them in the correct organization.

---

## Step 2: Install the EduTrack Package

Once Person Accounts are enabled, you can proceed with the package installation.

1.  Click the following installation link (or copy and paste it into your browser):
    [Install EduTrack Package (v1.0.0-1)](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tOS00000MFB1hYAH)
2.  Log in with your Salesforce credentials if prompted.
3.  Select **Install for All Users** to ensure all staff members can access the necessary components.
4.  Click **Install**.
5.  If prompted to approve third-party access (for external services if any), check the box and click **Continue**.
6.  You will receive an email once the installation is complete.

---

## Step 3: Initial Configuration (School Setup)

After successful installation, follow these steps to configure your school's details:

### 3.1 Assign Permission Sets
1.  In **Setup**, search for **Permission Sets**.
2.  Find and click on **EduTrack Full Access**.
3.  Click **Manage Assignments** > **Add Assignments**.
4.  Select the users (Administrators/Staff) and click **Assign**.

### 3.2 Access the School Setup Wizard
1.  Click the **App Launcher** (9-dot icon) and search for **EduPro Dashboard**.
2.  If this is your first time, the **Setup Wizard** will appear automatically.
3.  Fill in the mandatory details:
    - **School Name**: Your official school name.
    - **School Logo**: Upload your school's official logo.
    - **Contact Details**: Address, Email, and Phone number.
    - **Payment Details**: UPI IDs (PhonePe/GooglePay) and Bank Account details for fee invoices.
4.  Click **Save Setup**.

### 3.3 Configure Academic Years
1.  In the Dashboard or via the Setup tab, navigate to **Academic Year Management**.
2.  Click **Add New Academic Year**.
3.  Enter the range (e.g., `2025-2026`).
4.  Set the **Start Date** and **End Date**.
5.  Mark the current year as **Active**.

---

## Step 4: Final Verification
1.  Verify that the **Dashboard** metrics are visible (they will be zero initially).
2.  Ensure you can access the **Admission Manager** and **Student** tabs.
3.  You are now ready to start adding Classes, Sections, and Students!
