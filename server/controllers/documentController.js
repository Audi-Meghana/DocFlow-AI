const fs = require("fs");
const path = require("path");
const multer = require("multer");

const {
  createDocumentEntry,
  getDocumentsForUser,
  getDocumentById: getStoredDocument,
  updateDocumentEntry,
  deleteDocumentEntry,
  shareDocumentEntry,
} = require("../utils/storage");

const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    const allowedExtensions = [".txt", ".md", ".docx"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Only .txt, .md, and .docx files are allowed"));
    }
  },
});

const uploadFile = upload.single("file");

const hasDocumentAccess = (document, userId) => {
  if (!document || !userId) return false;

  const ownerId = document.owner?.toString();
  const currentUserId = userId.toString();

  if (ownerId === currentUserId) return true;

  return document.sharedWith?.some(
    (sharedUserId) => sharedUserId.toString() === currentUserId
  );
};

// Create Document
const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    const document = await createDocumentEntry({
      title,
      content,
      ownerId: req.user._id,
    });

    res.status(201).json({
      success: true,
      document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Documents
const getDocuments = async (req, res) => {
  try {
    const documents = await getDocumentsForUser(req.user._id);

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Document
const getDocumentById = async (req, res) => {
  try {
    const document = await getStoredDocument(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!hasDocumentAccess(document, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this document",
      });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Document
const updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    const document = await getStoredDocument(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!hasDocumentAccess(document, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this document",
      });
    }

    const updatedDocument = await updateDocumentEntry(req.params.id, {
      title: title ?? document.title,
      content: content ?? document.content,
    });

    res.status(200).json({
      success: true,
      document: updatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload a file and attach it to a document
const uploadDocumentFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please choose a .txt, .md, or .docx file to upload",
      });
    }

    const document = await getStoredDocument(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!hasDocumentAccess(document, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this document",
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const extension = path.extname(req.file.originalname).toLowerCase();

    const attachments = Array.isArray(document.attachments)
      ? document.attachments
      : [];
    attachments.push({
      fileName: req.file.originalname,
      fileUrl,
    });

    let importedContent = "";

    if (extension === ".txt" || extension === ".md") {
      importedContent = fs.readFileSync(req.file.path, "utf8").trim();

      if (importedContent) {
        document.content = `${document.content || ""}\n\n${importedContent}`.trim();
      }
    }

    const updatedDocument = await updateDocumentEntry(req.params.id, {
      attachments,
      content: document.content,
    });

    res.status(200).json({
      success: true,
      message: `Uploaded ${req.file.originalname} successfully`,
      document: updatedDocument,
      importedContent: importedContent.slice(0, 500),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Share Document
const shareDocument = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide the recipient email",
      });
    }

    const cleanEmail = email.trim();
    const result = await shareDocumentEntry(
      req.params.id,
      req.user._id,
      cleanEmail
    );

    if (result.error === "not-found") {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (result.error === "forbidden") {
      return res.status(403).json({
        success: false,
        message: "Only the owner can share this document",
      });
    }

    if (result.error === "recipient-not-found") {
      return res.status(400).json({
        success: false,
        message: `No registered user found with email "${cleanEmail}". Make sure they have signed up!`,
      });
    }

    if (result.error === "self-share") {
      return res.status(400).json({
        success: false,
        message: "You cannot share with yourself",
      });
    }

    res.status(200).json({
      success: true,
      message: `Document shared with ${result.recipient.email}`,
      document: result.document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Document
const deleteDocument = async (req, res) => {
  try {
    const document = await getStoredDocument(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const ownerId = document.owner?.toString();
    const currentUserId = req.user._id?.toString();

    if (ownerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can delete this document",
      });
    }

    await deleteDocumentEntry(req.params.id);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  shareDocument,
  deleteDocument,
  uploadDocumentFile,
  uploadFile,
};