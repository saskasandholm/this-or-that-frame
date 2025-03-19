import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Define source and destination paths
    const docsDir = path.join(process.cwd(), 'docs');
    const publicDocsDir = path.join(process.cwd(), 'public', 'docs');

    // Create public/docs directory if it doesn't exist
    if (!fs.existsSync(publicDocsDir)) {
      fs.mkdirSync(publicDocsDir, { recursive: true });
    }

    // Get all markdown files
    const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));

    // Copy each file to public directory
    const copiedFiles = files.map(file => {
      const sourcePath = path.join(docsDir, file);
      const destPath = path.join(publicDocsDir, file);

      // Read the file and write it to the destination
      const content = fs.readFileSync(sourcePath, 'utf8');
      fs.writeFileSync(destPath, content);

      return { file, copied: true };
    });

    return NextResponse.json({
      success: true,
      message: 'Documentation files copied successfully',
      files: copiedFiles,
    });
  } catch (error) {
    console.error('Error copying documentation files:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to copy documentation files',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
