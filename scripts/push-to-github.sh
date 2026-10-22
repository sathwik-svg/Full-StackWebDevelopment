#!/usr/bin/env bash
# Push Task 2 branch to GitHub repository: https://github.com/sathwik-svg/Full-StackWebDevelopment

set -e

BRANCH_NAME="${1:-task2}"
REMOTE_REPO="https://github.com/sathwik-svg/Full-StackWebDevelopment.git"

echo "=== Formflow Task 2 GitHub Push Helper ==="
echo "Target repository: $REMOTE_REPO"
echo "Target branch:     $BRANCH_NAME"
echo ""

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Found GITHUB_TOKEN environment variable. Pushing securely..."
  git push "https://${GITHUB_TOKEN}@github.com/sathwik-svg/Full-StackWebDevelopment.git" "task2:${BRANCH_NAME}"
  echo "✓ Successfully pushed Task 2 to ${REMOTE_REPO} branch ${BRANCH_NAME}!"
else
  echo "No GITHUB_TOKEN detected in environment."
  echo "Run one of the following commands in your terminal to push:"
  echo ""
  echo "Option 1 (Using Git CLI / SSH):"
  echo "  git push origin task2"
  echo ""
  echo "Option 2 (Using GitHub Personal Access Token):"
  echo "  git push https://<YOUR_PERSONAL_ACCESS_TOKEN>@github.com/sathwik-svg/Full-StackWebDevelopment.git task2"
  echo ""
  echo "Option 3 (Merge task2 directly into main):"
  echo "  git checkout main"
  echo "  git merge task2"
  echo "  git push origin main"
fi
