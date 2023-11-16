const express = require("express");
const Port = process.env.PORT || 3400;
const cors = require("cors");
const Admin = require("./model/Users");
const Users = require("./model/Users");
const Product = require("./model/Product");
const Jwt = require("jsonwebtoken");
const key = "e-com";
const app = express();
require("./db/databas");

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Helloo");
});

app.post("/signin", async (req, res) => {
  try {
    const user = new Admin(req.body);
    const result = await user.save();
    result2 = result.toObject();
    delete result2.password;

    Jwt.sign({ user: result2 }, key, { expiresIn: "2h" }, (err, token) => {
      if (err) {
        console.error("Error creating token:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.send({ user: result2, auth: token });
      }
    });
  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    const user = await Users.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, key, { expiresIn: "1h" }, (err, token) => {
        if (err) {
          res.send({ result: "Something went wrong ... Try again later" });
        }
        res.send({ user, auth: token });
      });
    } else {
      res.json({ status: "error", message: "Not found" });
    }
  } else {
    res.json({ status: "error", messege: "No user exists" });
  }
});

app.post("/add-product", verifyToken, async (req, res) => {
  try {
    const prod = new Product(req.body);
    const result = await prod.save();
    console.log("Data send:", result);
    res.send(result);
  } catch (error) {
    console.error("Error saving data to MongoDB:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/add-product", verifyToken, async (req, res) => {
  const productList = await Product.find();
  if (productList.length > 0) res.send(productList);
  else res.send("No products found");
});

app.delete("/delete/:id", verifyToken, async (req, res) => {
  let deleteProd = await Product.deleteOne({ _id: req.params.id });
  res.json({ status: "success" });
});

app.get("/add-product/:id", verifyToken, async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) res.send(result);
  else {
    res.send("No result found");
  }

  app.put("/add-product/:id", verifyToken, async (req, res) => {
    let result = await Product.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );

    res.send(result);
  });
});

app.get("/search/:key", verifyToken, async (req, res) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { brand: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});

//creating a middleware to verfiy the token

function verifyToken(req, res, next) {
  let tok = req.headers["authorization"];
  if (tok) {
    tok = tok.split(" ")[1];
    //verify the token
    Jwt.verify(tok, key, (error, success) => {
      if (error)
        res.status(401).send({ message: "Please provide valid token" });
      else {
        next();
      }
    });
  } else {
    res.status(403).send({ message: "Please add valid token on header" });
  }
}
app.listen(Port, () => {
  console.log("Server Running");
});
