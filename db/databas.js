const mongoose = require("mongoose");

mongoose
  .connect("mongodb://0.0.0.0:27017/DashBoard")
  .then(() => {
    console.log("Conneted");
  })
  .catch((e) => {
    console.log("Error Message:", e.message);
  });
