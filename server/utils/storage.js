const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");

const dataDir = process.env.DOCFLOW_DATA_DIR
  ? path.resolve(process.env.DOCFLOW_DATA_DIR)
  : path.join(__dirname, "..", "data");
const storePath = process.env.DOCFLOW_STORE_PATH
  ? path.resolve(process.env.DOCFLOW_STORE_PATH)
  : path.join(dataDir, "store.json");

let storeCache = null;
let initialized = false;

const defaultStore = {
  users: [],
  documents: [],
};

const createId = (prefix = "id") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const ensureDataDir = async () => {
  await fs.mkdir(dataDir, { recursive: true });
};

const seedDemoUsers = async () => {
  if (storeCache.users.length > 0) return;

  const demoPassword = await bcrypt.hash("demo123", 10);
  const alexPassword = await bcrypt.hash("demo123", 10);

  storeCache.users.push(
    {
      _id: createId("user"),
      name: "Demo User",
      email: "demo@docflow.ai",
      password: demoPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: createId("user"),
      name: "Alex Rivera",
      email: "alex@docflow.ai",
      password: alexPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
};

const persistStore = async () => {
  await ensureDataDir();
  await fs.writeFile(storePath, JSON.stringify(storeCache, null, 2), "utf8");
};

const initializeStore = async () => {
  if (initialized) return storeCache;

  await ensureDataDir();

  try {
    const raw = await fs.readFile(storePath, "utf8");
    storeCache = JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      storeCache = JSON.parse(JSON.stringify(defaultStore));
      await seedDemoUsers();
      await persistStore();
    } else {
      throw error;
    }
  }

  if (!storeCache.users) storeCache.users = [];
  if (!storeCache.documents) storeCache.documents = [];

  initialized = true;
  return storeCache;
};

const getStore = async () => {
  await initializeStore();
  return storeCache;
};

const findUserByEmail = async (email) => {
  if (!email) return null;
  const store = await getStore();
  const cleanEmail = email.trim().toLowerCase();
  return store.users.find((user) => user.email.toLowerCase() === cleanEmail) || null;
};

const findUserById = async (id) => {
  if (!id) return null;
  const store = await getStore();
  const targetId = id.toString();
  return store.users.find((user) => user._id.toString() === targetId) || null;
};

const createUser = async ({ name, email, password }) => {
  const store = await getStore();
  const cleanEmail = email.trim().toLowerCase();
  const existing = store.users.find((user) => user.email.toLowerCase() === cleanEmail);

  if (existing) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    _id: createId("user"),
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.users.push(user);
  await persistStore();
  return user;
};

const createDocumentEntry = async ({ title, content = "", ownerId, attachments = [] }) => {
  const store = await getStore();
  const document = {
    _id: createId("doc"),
    title: title ? title.trim() : "Untitled Document",
    content,
    owner: ownerId.toString(),
    sharedWith: [],
    attachments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.documents.push(document);
  await persistStore();
  return document;
};

const getDocumentsForUser = async (userId) => {
  const store = await getStore();
  const targetUserId = userId.toString();
  return store.documents
    .filter((doc) => doc.owner.toString() === targetUserId || doc.sharedWith.map(id => id.toString()).includes(targetUserId))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

const getDocumentById = async (id) => {
  const store = await getStore();
  const targetId = id.toString();
  return store.documents.find((doc) => doc._id.toString() === targetId) || null;
};

const updateDocumentEntry = async (id, updates) => {
  const store = await getStore();
  const targetId = id.toString();
  const document = store.documents.find((doc) => doc._id.toString() === targetId);

  if (!document) return null;

  Object.assign(document, updates, {
    updatedAt: new Date().toISOString(),
  });

  await persistStore();
  return document;
};

const shareDocumentEntry = async (documentId, ownerId, recipientEmail) => {
  if (!recipientEmail) {
    return { document: null, recipient: null, error: "recipient-not-found" };
  }

  const store = await getStore();
  const targetDocId = documentId.toString();
  const targetOwnerId = ownerId.toString();
  const cleanRecipientEmail = recipientEmail.trim().toLowerCase();

  const document = store.documents.find((doc) => doc._id.toString() === targetDocId);

  if (!document) return { document: null, recipient: null, error: "not-found" };
  if (document.owner.toString() !== targetOwnerId) return { document: null, recipient: null, error: "forbidden" };

  const recipient = store.users.find(
    (user) => user.email.toLowerCase() === cleanRecipientEmail
  );

  if (!recipient) return { document: null, recipient: null, error: "recipient-not-found" };
  if (recipient._id.toString() === targetOwnerId) return { document: null, recipient, error: "self-share" };

  if (!document.sharedWith) document.sharedWith = [];

  const recipientIdStr = recipient._id.toString();
  const isAlreadyShared = document.sharedWith.some((id) => id.toString() === recipientIdStr);

  if (!isAlreadyShared) {
    document.sharedWith.push(recipient._id);
    document.updatedAt = new Date().toISOString();
    await persistStore();
  }

  return { document, recipient, error: null };
};

const deleteDocumentEntry = async (id) => {
  const store = await getStore();
  const targetId = id.toString();
  const index = store.documents.findIndex((doc) => doc._id.toString() === targetId);

  if (index === -1) return false;

  store.documents.splice(index, 1);
  await persistStore();
  return true;
};

module.exports = {
  initializeStore,
  createUser,
  findUserByEmail,
  findUserById,
  createDocumentEntry,
  getDocumentsForUser,
  getDocumentById,
  updateDocumentEntry,
  shareDocumentEntry,
  deleteDocumentEntry,
};