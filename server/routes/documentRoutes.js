const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  shareDocument,
  deleteDocument,
  uploadDocumentFile,
  uploadFile,
} = require("../controllers/documentController");

router.post("/", protect, createDocument);
router.get("/", protect, getDocuments);
router.post("/:id/upload", protect, uploadFile, uploadDocumentFile);
router.post("/:id/share", protect, shareDocument);
router.get("/:id", protect, getDocumentById);
router.put("/:id", protect, updateDocument);
router.delete("/:id", protect, deleteDocument);

module.exports = router;