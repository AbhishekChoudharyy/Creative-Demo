import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '@/lib/mongodb';
import { ContentCopyModel } from '@/models/ContentCopy';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STORAGE_FILE_PATH = path.join(process.cwd(), 'content_copy_saved.json');

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0'
};

const MAIN_DOC_ID = 'main_official_copy';

export async function GET() {
  try {
    // 1. Try MongoDB Atlas if URI is present
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const record = await ContentCopyModel.findOne({ docId: MAIN_DOC_ID });
      if (record && record.data) {
        return NextResponse.json({ success: true, data: record.data, source: 'mongodb' }, { headers: noCacheHeaders });
      }
    }

    // 2. Fallback to local file
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      const fileData = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
      const json = JSON.parse(fileData);
      return NextResponse.json({ success: true, data: json, source: 'file' }, { headers: noCacheHeaders });
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

    // 1. Save to MongoDB Atlas if URI is present
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      await ContentCopyModel.findOneAndUpdate(
        { docId: MAIN_DOC_ID },
        { data: body.data },
        { upsert: true, new: true }
      );
    }

    // 2. Also save to local file backup
    fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(body.data, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Saved successfully to MongoDB Atlas & server' }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error saving content copy:', error);
    return NextResponse.json({ success: false, error: 'Failed to save content copy' }, { status: 500, headers: noCacheHeaders });
  }
}

export async function DELETE() {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      await ContentCopyModel.deleteOne({ docId: MAIN_DOC_ID });
    }

    if (fs.existsSync(STORAGE_FILE_PATH)) {
      fs.unlinkSync(STORAGE_FILE_PATH);
    }
    return NextResponse.json({ success: true, message: 'Reset storage successfully' }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error deleting saved content copy:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset storage' }, { status: 500, headers: noCacheHeaders });
  }
}
