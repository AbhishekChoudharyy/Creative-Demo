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
  // 1. Try MongoDB Atlas
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const record = await ContentCopyModel.findOne({ docId: MAIN_DOC_ID });
      if (record && record.data) {
        return NextResponse.json({ success: true, data: record.data, source: 'mongodb' }, { headers: noCacheHeaders });
      }
    } catch (mongoErr: any) {
      console.error('⚠️ MongoDB Atlas GET Connection Notice:', mongoErr?.message || mongoErr);
    }
  }

  // 2. Fallback to local file storage if Mongo Atlas fails or hasn't saved data yet
  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      const fileData = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
      const json = JSON.parse(fileData);
      return NextResponse.json({ success: true, data: json, source: 'file' }, { headers: noCacheHeaders });
    }
  } catch (fileErr) {
    console.error('Error reading fallback file:', fileErr);
  }

  return NextResponse.json({ success: true, data: null, source: 'default' }, { headers: noCacheHeaders });
}

export async function POST(request: Request) {
  let mongoSuccess = false;
  let fileSuccess = false;

  try {
    const body = await request.json();
    if (!body || !body.data) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400, headers: noCacheHeaders });
    }

    // 1. Try Mongo Atlas
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        await ContentCopyModel.findOneAndUpdate(
          { docId: MAIN_DOC_ID },
          { data: body.data },
          { upsert: true, new: true }
        );
        mongoSuccess = true;
      } catch (mongoErr: any) {
        console.error('⚠️ MongoDB Atlas POST Connection Notice:', mongoErr?.message || mongoErr);
      }
    }

    // 2. Always backup to local server file
    try {
      fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(body.data, null, 2), 'utf-8');
      fileSuccess = true;
    } catch (fileErr) {
      console.error('Error writing fallback file:', fileErr);
    }

    if (mongoSuccess || fileSuccess) {
      return NextResponse.json({
        success: true,
        message: mongoSuccess ? 'Saved to MongoDB Atlas Cloud!' : 'Saved to Server File Storage',
        source: mongoSuccess ? 'mongodb' : 'file'
      }, { headers: noCacheHeaders });
    }

    return NextResponse.json({ success: false, error: 'Failed to save to any storage' }, { status: 500, headers: noCacheHeaders });
  } catch (error: any) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500, headers: noCacheHeaders });
  }
}

export async function DELETE() {
  try {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        await ContentCopyModel.deleteOne({ docId: MAIN_DOC_ID });
      } catch (mongoErr) {
        console.error('MongoDB Atlas DELETE Notice:', mongoErr);
      }
    }

    if (fs.existsSync(STORAGE_FILE_PATH)) {
      fs.unlinkSync(STORAGE_FILE_PATH);
    }
    return NextResponse.json({ success: true, message: 'Reset storage successfully' }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500, headers: noCacheHeaders });
  }
}
