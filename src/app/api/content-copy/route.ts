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
const isVercel = !!process.env.VERCEL;

export async function GET() {
  let mongoError = null;

  // 1. Try MongoDB Atlas if URI is set
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const record = await ContentCopyModel.findOne({ docId: MAIN_DOC_ID });
      if (record && record.data) {
        return NextResponse.json({ success: true, data: record.data, source: 'mongodb' }, { headers: noCacheHeaders });
      }
    } catch (mongoErr: any) {
      mongoError = mongoErr?.message || String(mongoErr);
      console.error('⚠️ MongoDB Atlas GET Error:', mongoError);
    }
  }

  // 2. Fallback to local file storage if not running on Vercel
  if (!isVercel) {
    try {
      if (fs.existsSync(STORAGE_FILE_PATH)) {
        const fileData = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
        const json = JSON.parse(fileData);
        return NextResponse.json({ success: true, data: json, source: 'file' }, { headers: noCacheHeaders });
      }
    } catch (fileErr) {
      console.error('Error reading fallback file:', fileErr);
    }
  }

  return NextResponse.json({
    success: true,
    data: null,
    source: 'default',
    warning: mongoError ? `MongoDB connection issue: ${mongoError}` : undefined
  }, { headers: noCacheHeaders });
}

export async function POST(request: Request) {
  let mongoError = null;

  try {
    const body = await request.json();
    if (!body || !body.data) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400, headers: noCacheHeaders });
    }

    // 1. Save to MongoDB Atlas
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        await ContentCopyModel.findOneAndUpdate(
          { docId: MAIN_DOC_ID },
          { data: body.data },
          { upsert: true, new: true }
        );
        return NextResponse.json({
          success: true,
          message: 'Saved to MongoDB Atlas Cloud!',
          source: 'mongodb'
        }, { headers: noCacheHeaders });
      } catch (mongoErr: any) {
        mongoError = mongoErr?.message || String(mongoErr);
        console.error('⚠️ MongoDB Atlas POST Error:', mongoError);
      }
    }

    // 2. Local File Save fallback (only outside Vercel)
    if (!isVercel) {
      try {
        fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(body.data, null, 2), 'utf-8');
        return NextResponse.json({
          success: true,
          message: 'Saved to Local Server Storage',
          source: 'file'
        }, { headers: noCacheHeaders });
      } catch (fileErr) {
        console.error('Error writing fallback file:', fileErr);
      }
    }

    return NextResponse.json({
      success: false,
      error: mongoError
        ? `MongoDB Atlas Error: ${mongoError}. Ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.`
        : 'MONGODB_URI environment variable is missing on Vercel!'
    }, { status: 500, headers: noCacheHeaders });

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

    if (!isVercel && fs.existsSync(STORAGE_FILE_PATH)) {
      fs.unlinkSync(STORAGE_FILE_PATH);
    }
    return NextResponse.json({ success: true, message: 'Reset storage successfully' }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500, headers: noCacheHeaders });
  }
}
