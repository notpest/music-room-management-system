import { scanGmailForEntryLogsImap } from '../lib/ImapScanner.mjs';

(async () => {
  try {
    await scanGmailForEntryLogsImap();
    console.log("Gmail scan completed.");
  } catch (err) {
    console.error("Error during Gmail scan:", err);
  }
  process.exit(0);
})();
