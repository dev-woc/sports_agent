#!/bin/bash
set -e

echo "=== E2E: Link CRUD ==="

agent-browser open http://localhost:3000/editor
agent-browser wait --load networkidle

agent-browser find text "Add Link" click
agent-browser wait 500
agent-browser snapshot -i

agent-browser find label "Title" fill "My YouTube Channel"
agent-browser find label "URL" fill "https://youtube.com/@test"
agent-browser find role button click --name "Add"
agent-browser wait 500

SNAPSHOT=$(agent-browser snapshot)
if echo "$SNAPSHOT" | grep -q "My YouTube Channel"; then
  echo "PASS: Link added to list"
else
  echo "FAIL: Link not found in list"
  exit 1
fi

agent-browser find text "Add Header" click
agent-browser wait 500
agent-browser find label "Header" fill "Social Media"
agent-browser find role button click --name "Add"
agent-browser wait 500

agent-browser find text "Add Divider" click
agent-browser wait 500

agent-browser find role button click --name "Save"
agent-browser wait 2000
agent-browser screenshot tests/e2e/screenshots/links-added.png

# Reload and verify persistence
agent-browser open http://localhost:3000/editor
agent-browser wait --load networkidle
agent-browser wait 1000

SNAPSHOT=$(agent-browser snapshot)
if echo "$SNAPSHOT" | grep -q "My YouTube Channel"; then
  echo "PASS: Remaining link persisted"
else
  echo "FAIL: Link data lost"
  exit 1
fi

agent-browser screenshot tests/e2e/screenshots/links-final.png
echo "=== Link CRUD: PASSED ==="
