const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, default: "" },
    type: { type: String, default: "" },
    uploadedAt: { type: String, default: "" },
    fileUrl: { type: String, default: "" }, // Keeps support for raw URL storage if needed
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Document",
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [attachmentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);