import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/epub+zip',
      'image/jpeg',
      'image/png',
      'video/mp4',
      'application/zip',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, EPUB, JPEG, PNG, MP4, ZIP, and TXT files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 100MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const extension = path.extname(file.name);
    const uniqueName = `${randomUUID()}${extension}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to public/uploads directory
    const filePath = path.join(process.cwd(), 'public', 'uploads', uniqueName);
    await writeFile(filePath, buffer);

    // Return file metadata
    return NextResponse.json({
      success: true,
      file: {
        id: uniqueName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/${uniqueName}`,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Get list of uploaded files
export async function GET() {
  try {
    const fs = await import('fs/promises');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    try {
      const files = await fs.readdir(uploadsDir);
      const fileList = files.map(filename => ({
        id: filename,
        url: `/uploads/${filename}`
      }));

      return NextResponse.json({ files: fileList });
    } catch (error) {
      // Directory doesn't exist yet
      return NextResponse.json({ files: [] });
    }
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
