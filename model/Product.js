const mongoose = require("mongoose");

const product = mongoose.Schema({
  name: {
    type: String,
  },
  brand: {
    type: String,
  },
  price: {
    type: String,
  },
  category: {
    type: String,
  },
  userID: {
    type: String,
  },
});

module.exports = new mongoose.model("products", product);
