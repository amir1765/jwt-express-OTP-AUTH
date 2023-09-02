const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

// Update below to match your own MongoDB connection string.
const { MONGO_URL } = process.env;

mongoose.connection.once("open", () => {
  // eslint-disable-next-line no-console
  console.log("MongoDB connection ready!");
});

mongoose.connection.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
