import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    tender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tender",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quotedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    documents: [
      {
        fileName: String,
        filePath: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    aiScore: {
      type: Number,
      default: null,
    },
    aiFlags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["submitted", "shortlisted", "rejected", "awarded"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  },
);

bidSchema.index({ tender: 1, vendor: 1 }, { unique: true });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
