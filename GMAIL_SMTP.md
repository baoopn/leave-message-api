# Setting Up Gmail SMTP

To send emails using Gmail's SMTP server, follow these steps:

## Step 1: Enable 2-Step Verification

1. Go to your [Google Account](https://myaccount.google.com/).
2. In the "Security" section of your Google Account, enable 2-Step Verification if it’s not already enabled.
3. Add several or all Second Steps. If you generate backup code, make sure to keep it securely and only be seen by you.

## Step 2: Create an App Password
1. Go to your [Google Account](https://myaccount.google.com/) if you has already left.
2. Search for "App Passwords" in the search bar.
3. Generate the app password and note it down. You will use this password instead of your regular Google account password. 

## Step 3: (Optional) Add Another Email Address to Gmail
To add another email address to your current Gmail account and use it to send emails, follow these steps:
1. Go to Gmail Settings.
2. In the Quick Settings box, select "See all settings".
3. Navigate to the "Accounts and Import" tab.
4. In the "Send mail as" section, click "Add another email address".
5. A window will appear. Enter your desired name and email address, then click "Next Step".
6. If you entered a Gmail address, click "Send Verification" and check the inbox of the added email address to verify it. You're done.
7. If you entered a non-Gmail address, you will need to configure an SMTP server for that address (instructions for setting up with Gmail SMTP server are provided below).
8. In the "SMTP Server" box, enter smtp.gmail.com. In the "Username" box, enter your Gmail username (the part before @ in your Gmail address). For "Password", enter the App Password you generated in Step 2.
9. Click "Add Account" and verify your added email address.

By following these steps, you can send emails from another email address using your current Gmail account.

**Notes**: To receive emails from additional email addresses in your current Gmail inbox, you may need some additional setup.
