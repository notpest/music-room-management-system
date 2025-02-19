// lib/gmailImapScanner.mjs
import Imap from 'node-imap';
import { simpleParser } from 'mailparser';

const GMAIL_USER = process.env.GMAIL_USER || "mailscript.test0611@gmail.com";
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD || "mail@123";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function scanGmailForEntryLogsImap() {
  const imap = new Imap({
    user: GMAIL_USER,
    password: GMAIL_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
  });

  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }

  return new Promise((resolve, reject) => {
    imap.once('ready', () => {
      openInbox((err, box) => {
        if (err) {
          reject(err);
          return;
        }

        imap.search(['ALL', ['BODY', 'equipment_id:']], (err, results) => {
          if (err) {
            reject(err);
            return;
          }
          if (!results || results.length === 0) {
            console.log("No matching messages found.");
            imap.end();
            resolve();
            return;
          }

          const fetcher = imap.fetch(results, { bodies: '' });
          fetcher.on('message', (msg, seqno) => {
            let emailData = '';
            msg.on('body', (stream, info) => {
              stream.on('data', (chunk) => {
                emailData += chunk.toString('utf8');
              });
            });
            msg.once('end', async () => {
              try {
                const parsed = await simpleParser(emailData);
                // Look for a UUID following "equipment_id:" in the email text
                const uuidRegex = /equipment_id:\s*([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
                const match = uuidRegex.exec(parsed.text || '');
                if (match) {
                  const equipment_id = match[1];
                  console.log(`Found equipment_id: ${equipment_id} in message ${seqno}`);
                  await fetch(API_URL + '/api/entrylogs', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      equipment_id,
                      scanned_at: new Date().toISOString(),
                    }),
                  });
                }
              } catch (parseError) {
                console.error("Error parsing email:", parseError);
              }
            });
          });
          fetcher.once('error', (err) => {
            console.error("Fetch error:", err);
          });
          fetcher.once('end', () => {
            console.log("Done fetching messages.");
            imap.end();
            resolve();
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error("IMAP connection error:", err);
      reject(err);
    });

    imap.once('end', () => {
      console.log("IMAP connection ended.");
    });

    imap.connect();
  });
}
