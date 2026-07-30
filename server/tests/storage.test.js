const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

test("creates and shares a document through the file-backed store", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "docflow-test-"));
  process.env.DOCFLOW_DATA_DIR = tempDir;
  process.env.DOCFLOW_STORE_PATH = path.join(tempDir, "store.json");

  const storage = require("../utils/storage");

  const owner = await storage.createUser({
    name: "Tester",
    email: "tester@example.com",
    password: "secret123",
  });
  const recipient = await storage.createUser({
    name: "Sharee",
    email: "sharee@example.com",
    password: "secret123",
  });

  const document = await storage.createDocumentEntry({
    title: "Test Document",
    content: "<p>Initial draft</p>",
    ownerId: owner._id,
  });

  const shareResult = await storage.shareDocumentEntry(document._id, owner._id, recipient.email);
  const restoredDocument = await storage.getDocumentById(document._id);

  assert.ok(owner, "owner user should be created");
  assert.ok(recipient, "recipient user should be created");
  assert.equal(shareResult.error, null, "sharing should succeed");
  assert.equal(restoredDocument.title, "Test Document");
  assert.equal(restoredDocument.sharedWith.length, 1);
  assert.equal(restoredDocument.sharedWith[0], recipient._id);
});
