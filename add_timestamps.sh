#!/bin/bash

for file in $(find docs -name "*.md" -type f -not -path "*/archive*" -not -path "*/archived*" -not -path "*/components*"); do
  if ! grep -q "Last Updated:" "$file"; then
    awk "NR==1{print; print \"\n*Last Updated: March 25, 2024*\n\"; next}1" "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
  fi
done
