#!/bin/bash
set -e
echo "=== E2E: Login Flow ==="
agent-browser open http://localhost:3000/login
agent-browser wait --load networkidle
agent-browser screenshot tests/e2e/screenshots/login-page.png
SNAPSHOT=$(agent-browser snapshot)
if echo "$SNAPSHOT" | grep -qi "google"; then
  echo "PASS: Google OAuth button present"
else
  echo "FAIL: Google OAuth button not found"
  exit 1
fi
echo "=== Login Flow: PASSED ==="
