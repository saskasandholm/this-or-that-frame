#!/bin/bash

# This script updates all occurrences of the old ngrok URLs with the new one

# Check if a new URL was provided
if [ -z "$1" ]; then
  echo "Usage: ./update-ngrok-url.sh <new-ngrok-url>"
  echo "Example: ./update-ngrok-url.sh https://your-subdomain.ngrok.io"
  exit 1
fi

NEW_URL=$1
echo "Updating all ngrok URLs to: $NEW_URL"

# Find all files that might contain ngrok URLs
FILES=$(grep -r --include="*.ts" --include="*.tsx" --include="*.html" "ngrok" . | cut -d: -f1 | sort | uniq)

for file in $FILES; do
  echo "Checking file: $file"
  
  # Replace all old URL patterns
  sed -i '' "s|https://c745-94-207-115-33.ngrok-free.app|$NEW_URL|g" "$file"
  sed -i '' "s|https://15f6-94-207-115-33.ngrok-free.app|$NEW_URL|g" "$file"
  sed -i '' "s|https://10cfb18ffbcd.ngrok.app|$NEW_URL|g" "$file"
  sed -i '' "s|https://1bcfb18ffbcd.ngrok.app|$NEW_URL|g" "$file"
done

echo "Update complete! Please restart your development server." 