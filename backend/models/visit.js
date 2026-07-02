const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    device: {
      type: String,
      default: "Desktop",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    referrer: {
      type: String,
      default: "Direct",
    },
    country: {
      type: String,
      default: "Localhost",
    },
    city: {
      type: String,
      default: "Localhost",
    },
    ip: {
      type: String,
    },
  },
  { timestamps: true }
);

const Visit = mongoose.model("visit", visitSchema);

module.exports = Visit;
