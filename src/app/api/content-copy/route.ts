import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Save JSON file in the project workspace root
const STORAGE_FILE_PATH = path.join(process.cwd(), 'content_copy_saved.json');

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function GET() {
  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      const fileData = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
      const json = JSON.parse(fileData);
      return NextResponse.json({ success: true, data: json }, { headers: noCacheHeaders });
    }
  } catch (error) {
    console.error('Error reading saved content copy:', error);
  }
  return NextResponse.json({ success: true, data: null }, { headers: noCacheHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.data) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400, headers: noCacheHeaders });
    }

    fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(body.data, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Saved to server successfully' }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error saving content copy:', error);
    return NextResponse.json({ success: false, error: 'Failed to save to server' }, { status: 500, headers: noCacheHeaders });
  }
}

export async function DELETE() {
  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      fs.unlinkSync(STORAGE_FILE_PATH);
    }
    return NextResponse.json({ success: true, message: 'Reset server storage successfully' }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error deleting saved content copy:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset server storage' }, { status: 500, headers: noCacheHeaders });
  }
}
