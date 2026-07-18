import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Save JSON file in the project workspace root
const STORAGE_FILE_PATH = path.join(process.cwd(), 'content_copy_saved.json');

export async function GET() {
  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      const fileData = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
      const json = JSON.parse(fileData);
      return NextResponse.json({ success: true, data: json });
    }
  } catch (error) {
    console.error('Error reading saved content copy:', error);
  }
  return NextResponse.json({ success: true, data: null });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.data) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(body.data, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Saved to server successfully' });
  } catch (error) {
    console.error('Error saving content copy:', error);
    return NextResponse.json({ success: false, error: 'Failed to save to server' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      fs.unlinkSync(STORAGE_FILE_PATH);
    }
    return NextResponse.json({ success: true, message: 'Reset server storage successfully' });
  } catch (error) {
    console.error('Error deleting saved content copy:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset server storage' }, { status: 500 });
  }
}
