import smtplib
from email.message import EmailMessage
from backend.core.config import settings

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465
SMTP_USER = settings.SMTP_USER
SMTP_PASSWORD = settings.SMTP_PASSWORD

def send_email(to_email: str, subject: str, body: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"Skipping email to {to_email}: SMTP credentials not configured.")
        return

    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"Successfully sent email to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

def send_verification_email(to_email: str, token: str):
    subject = "Verify your TrustLens AI Account"
    link = f"http://localhost:5173/verify-email?token={token}"
    body = f"Welcome to TrustLens AI!\n\nPlease verify your email by clicking the link below:\n{link}\n\nStay safe,\nThe TrustLens AI Team"
    send_email(to_email, subject, body)

def send_reset_password_email(to_email: str, token: str):
    subject = "TrustLens AI Password Reset"
    link = f"http://localhost:5173/reset-password?token={token}"
    body = f"Hello,\n\nYou requested a password reset for your TrustLens AI account. Click the link below to set a new password:\n{link}\n\nIf you did not request this, please ignore this email.\n\nStay safe,\nThe TrustLens AI Team"
    send_email(to_email, subject, body)


def send_unrecognized_login_alert(email: str, device: str, browser: str, ip: str):
    print(f'''
========== UNRECOGNIZED LOGIN ALERT ==========
To: {email}
Subject: New Login from unrecognized device

A login was detected from a new device/IP:
Device: {device}
Browser: {browser}
IP: {ip}
================================================''')
