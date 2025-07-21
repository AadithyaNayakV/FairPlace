// appwriteClient.js
const { Client, Storage, ID, InputFile, Permission, Role } = require("node-appwrite");
const config = require("./cloudinary");

const client = new Client()
  .setEndpoint(config.APPWRITE_ENDPOINT)
  .setProject(config.APPWRITE_PROJECT_ID)
  .setKey(config.APPWRITE_API_KEY);

const storage = new Storage(client);

module.exports = {
  storage,
  ID,
  InputFile,
  Permission,
  Role,
};
