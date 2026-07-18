const dns = require('dns');

const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

const mongoose = require("mongoose");
const { port, mongoUri } = require("./config/env");
const app = require("./app");

const listenPort = Number(port);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error("MongoDB Connection Failed:");
    console.error(error);
    process.exit(1);
  }
};

connectToDatabase()
  .then(() => {
    app.listen(listenPort);
  })
  .catch((error) => {
    console.error("Failed to start the server:", error.message);
    process.exit(1);
  });

module.exports = app;
