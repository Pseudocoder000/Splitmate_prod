const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { port, mongoUri, nodeEnv } = require("./config/env");
const app = require("./app");

const listenPort = Number(port);

let memoryServer;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB Atlas Connected");
  } catch (error) {
    // console.error("MongoDB Connection Failed:", error.message);
    console.error("MongoDB Connection Failed:");
    console.error(error);
    process.exit(1);
  }
};

connectToDatabase()
  .then(() => {
    app.listen(listenPort, () => {
      console.log(`SplitMate API running on port ${listenPort}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start the server:", error.message);
    process.exit(1);
  });

module.exports = app;
