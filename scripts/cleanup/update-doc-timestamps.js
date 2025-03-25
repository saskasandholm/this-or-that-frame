#!/usr/bin/env node

/**
 * Documentation Timestamp Update Script
 * 
 * This script updates the "Last Updated" timestamp in all markdown files.
 * It targets files that have a "Last Updated" line near the top of the file.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current date in format: March 25, 2024
const today = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Function to find all markdown files in a directory recursively
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findMarkdownFiles(filePath, fileList);
    } else if (path.extname(file) === '.md') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update the timestamp in a file
function updateTimestamp(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only update files that have been modified since the last timestamp update
    const lastModified = execSync(`git log -1 --format="%ad" -- "${filePath}"`, { encoding: 'utf8' }).trim();
    
    // If we can't get the last modified date, use the current date
    const lastModifiedDate = lastModified 
      ? new Date(lastModified) 
      : new Date();
    
    // Extract the current "Last Updated" timestamp if it exists
    const lastUpdatedMatch = content.match(/\*Last Updated: ([^\*]+)\*/);
    
    if (lastUpdatedMatch) {
      const lastUpdatedString = lastUpdatedMatch[1].trim();
      const lastUpdatedDate = new Date(lastUpdatedString);
      
      // Only update if the file has been modified since the last update date
      // or if the date couldn't be parsed
      if (isNaN(lastUpdatedDate.getTime()) || lastModifiedDate > lastUpdatedDate) {
        // Replace the existing timestamp
        content = content.replace(/\*Last Updated: [^\*]+\*/, `*Last Updated: ${today}*`);
        fs.writeFileSync(filePath, content);
        console.log(`Updated timestamp in ${filePath}`);
        return true;
      } else {
        console.log(`Skipping ${filePath} (not modified since last update)`);
        return false;
      }
    } else {
      // If there's no timestamp yet, try to add it after the first heading
      const headingMatch = content.match(/^#\s+(.+)$/m);
      
      if (headingMatch) {
        const headingPosition = content.indexOf(headingMatch[0]) + headingMatch[0].length;
        const updatedContent = 
          content.slice(0, headingPosition) + 
          `\n\n*Last Updated: ${today}*\n` + 
          content.slice(headingPosition);
        
        fs.writeFileSync(filePath, updatedContent);
        console.log(`Added timestamp to ${filePath}`);
        return true;
      } else {
        console.log(`Skipping ${filePath} (no heading found)`);
        return false;
      }
    }
  } catch (error) {
    console.error(`Error updating ${filePath}: ${error.message}`);
    return false;
  }
}

// Main execution
console.log(`Updating timestamps to: ${today}`);

// Find all markdown files in the docs directory
const allMarkdownFiles = findMarkdownFiles('docs');
console.log(`Found ${allMarkdownFiles.length} markdown files`);

// Update timestamps
let updatedCount = 0;
allMarkdownFiles.forEach(file => {
  if (updateTimestamp(file)) {
    updatedCount++;
  }
});

console.log(`\nTimestamp update complete!`);
console.log(`Updated ${updatedCount} out of ${allMarkdownFiles.length} files.`); 