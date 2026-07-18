import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '@/lib/mongodb';
import { ContentCopyModel } from '@/models/ContentCopy';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STORAGE_FILE_PATH = path.join(process.cwd(), 'content_copy_saved.json');
const MAIN_DOC_ID = 'main_official_copy';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: noCacheHeaders });
}

export async function GET() {
  // 1. Try MongoDB Atlas Cloud (Primary for Netlify Production & Local)
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const record = await ContentCopyModel.findOne({ docId: MAIN_DOC_ID });
      if (record && record.data) {
        return NextResponse.json(
          { success: true, data: record.data, source: 'mongodb' },
          { headers: noCacheHeaders }
        );
      }
    } catch (mongoErr: any) {
      console.error('MongoDB Atlas GET Connection Error:', mongoErr?.message || mongoErr);
    }
  }

  // 2. Fallback to local server file if in writable node environment
  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      const fileData = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
      const json = JSON.parse(fileData);
      return NextResponse.json(
        { success: true, data: json, source: 'file' },
        { headers: noCacheHeaders }
      );
    }
  } catch (fileErr) {
    // Read-only serverless filesystem notice
  }

  return NextResponse.json(
    { success: true, data: null, source: 'default', warning: !process.env.MONGODB_URI ? 'MONGODB_URI environment variable is missing on Netlify' : undefined },
    { headers: noCacheHeaders }
  );
}

export async function POST(request: Request) {
  let mongoSuccess = false;
  let fileSuccess = false;
  let errorMessage = '';

  try {
    const body = await request.json();
    if (!body || !body.data) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    // 1. Save to MongoDB Atlas Cloud Database
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
        errorMessage = mongoErr?.message || 'MongoDB connection failed';
        console.error('MongoDB Atlas POST Connection Error:', errorMessage);
      }
    } else {
      errorMessage = 'MONGODB_URI environment variable is missing in Netlify Site Settings';
    }

    // 2. Try saving to local file (safely ignored on read-only Netlify serverless lambdas)
    try {
      fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(body.data, null, 2), 'utf-8');
      fileSuccess = true;
    } catch (fileErr) {
      // Ignored on serverless read-only filesystems
    }

    if (mongoSuccess || fileSuccess) {
      return NextResponse.json(
        {
          success: true,
          message: mongoSuccess ? 'Saved to MongoDB Atlas Cloud Database!' : 'Saved to Server File',
          source: mongoSuccess ? 'mongodb' : 'file'
        },
        { headers: noCacheHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage || 'Failed to save to MongoDB Atlas' },
      { status: 500, headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function DELETE() {
  try {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        await ContentCopyModel.deleteOne({ docId: MAIN_DOC_ID });
      } catch (mongoErr) {
        console.error('MongoDB Atlas DELETE Error:', mongoErr);
      }
    }

    try {
      if (fs.existsSync(STORAGE_FILE_PATH)) {
        fs.unlinkSync(STORAGE_FILE_PATH);
      }
    } catch (fileErr) {
      // Ignored on serverless read-only filesystem
    }

    return NextResponse.json(
      { success: true, message: 'Reset storage successfully' },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
