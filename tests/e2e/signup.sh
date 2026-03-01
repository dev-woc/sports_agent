#!/bin/bash
set -e
echo "=== E2E: Signup Flow ==="
agent-browser open http://localhost:3000/signup
agent-browser wait --load networkidle
agent-browser screenshot tests/e2e/screenshots/signup-page.png
agent-browser snapshot -i
agent-browser find label "Name" fill "Test User"
agent-browser find label "Email" fill "test-$(date +%s)@example.com"
agent-browser find label "Password" fill "TestPassword123!"
agent-browser find label "Username" fill "testuser$(date +%s | tail -c 6)"
agent-browser wait 1000
agent-browser screenshot tests/e2e/screenshots/signup-filled.png
agent-browser find role button click --name "Create Account"
agent-browser wait --url "**/editor"
agent-browser wait --load networkidle
URL=$(agent-browser get url)
if [[ "$URL" == *"/editor"* ]]; then
  echo "PASS: Redirected to editor after signup"
else
  echo "FAIL: Expected /editor, got $URL"
  exit 1
fi
agent-browser screenshot tests/e2e/screenshots/signup-success.png
echo "=== Signup Flow: PASSED ==="
