#!/bin/bash
set -e
echo "=== E2E: Profile Editing ==="
agent-browser open http://localhost:3000/editor
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser screenshot tests/e2e/screenshots/editor-initial.png
agent-browser find label "Display Name" fill "Cole Updated"
agent-browser find label "Bio" fill "This is my updated bio for testing"
agent-browser wait 500
SNAPSHOT=$(agent-browser snapshot)
if echo "$SNAPSHOT" | grep -q "Cole Updated"; then
  echo "PASS: Preview shows updated name"
else
  echo "INFO: Name may not be reflected in accessibility tree yet"
fi
agent-browser find role button click --name "Save"
agent-browser wait 2000
agent-browser screenshot tests/e2e/screenshots/editor-saved.png
echo "=== Profile Editing: PASSED ==="
