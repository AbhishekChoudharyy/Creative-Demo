import mongoose, { Schema, model, models } from 'mongoose';

const ContentCopySchema = new Schema(
  {
    docId: {
      type: String,
      required: true,
      unique: true,
      default: 'main_official_copy'
    },
    data: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

export const ContentCopyModel = models.ContentCopy || model('ContentCopy', ContentCopySchema);
