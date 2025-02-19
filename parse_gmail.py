#!/usr/bin/env python
from __future__ import print_function
import os
import pickle
import base64
import re
from email import message_from_bytes
from datetime import datetime

import psycopg2
from psycopg2.extras import RealDictCursor

from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# Use the modify scope so we can remove the UNREAD label.
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
]

# Regular expression to match a UUID (equipment_id)
uuid_regex = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")

def authenticate_gmail():
    """Authenticates the user and returns a Gmail API service instance."""
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    service = build('gmail', 'v1', credentials=creds)
    return service

def parse_email(msg_raw):
    """Decodes and parses a raw email message (base64 encoded)."""
    msg_bytes = base64.urlsafe_b64decode(msg_raw.encode('ASCII'))
    mime_msg = message_from_bytes(msg_bytes)
    return mime_msg

def insert_entry_log(equipment_id):
    """Inserts a new entry_log record into the database using local time."""
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME", "music_room")
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "admin")

    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "INSERT INTO entry_log (equipment_id, scanned_at) VALUES (%s, %s) RETURNING id",
        (equipment_id, datetime.now())
    )
    inserted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return inserted['id']

def scan_inbox():
    service = authenticate_gmail()
    # Search for messages with labels INBOX and UNREAD.
    results = service.users().messages().list(
        userId='me',
        labelIds=['INBOX', 'UNREAD'],
        maxResults=20
    ).execute()
    messages = results.get('messages', [])
    new_records = 0

    if not messages:
        print("No messages found.")
        return new_records

    print(f"Found {len(messages)} messages.\n")
    for message in messages:
        msg_id = message['id']
        msg = service.users().messages().get(
            userId='me', id=msg_id, format='raw'
        ).execute()
        mime_msg = parse_email(msg['raw'])

        subject = mime_msg.get('Subject', '')
        body = ""
        if mime_msg.is_multipart():
            for part in mime_msg.walk():
                if part.get_content_type() == "text/plain":
                    try:
                        body = part.get_payload(decode=True).decode("utf-8", errors="replace")
                        break
                    except Exception:
                        continue
        else:
            try:
                body = mime_msg.get_payload(decode=True).decode("utf-8", errors="replace")
            except Exception:
                body = ""
        combined = f"{subject} {body}"
        match = uuid_regex.search(combined)
        if match:
            equipment_id = match.group(0)
            inserted_id = insert_entry_log(equipment_id)
            if inserted_id:
                new_records += 1
                print(f"Inserted entry_log for equipment_id: {equipment_id} (id: {inserted_id})")
        else:
            print("No UUID found in this message.")

        # Mark the message as read by removing the UNREAD label.
        try:
            modify_result = service.users().messages().modify(
                userId='me',
                id=msg_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            print(f"Marked message {msg_id} as read: {modify_result}")
        except Exception as e:
            print(f"Failed to mark message {msg_id} as read: {e}")

    return new_records

def main():
    count = scan_inbox()
    print(f"Inserted {count} new entry log record(s).")

if __name__ == '__main__':
    main()
