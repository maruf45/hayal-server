const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { query } = require("express");

// midlleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkczj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden acces" });
    }
    req.decoded = decoded;
    next();
  });
}
app.get("/", (req, res) => {
  res.send("Server is running");
});

async function run() {
  try {
    const database = client.db("CarDatabase");
    const carCollection = database.collection("UsedCars");
    const userOrderCollection = database.collection("UserOrders");
    const carCategories = database.collection("CarCategories");
    const userCollection = database.collection("userCollection");
    const blogs = database.collection("blogs");
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "15h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });
    app.get("/blogs", async (req, res) => {
      const query = {};
      const result = await blogs.find(query).toArray();
      res.send(result);
    });
    app.get("/userdCars", async (req, res) => {
      const query = {};
      const result = await carCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/userdCars", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await carCollection.insertOne(data);
      res.send(result);
    });
    app.get("/carCategories", async (req, res) => {
      const query = {};
      const result = await carCategories.find(query).toArray();
      res.send(result);
    });
    app.get("/usedCars/:categoriesName", async (req, res) => {
      const categoriesName = req.params.categoriesName;
      const query = { carBrand: categoriesName };
      const result = await carCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/userOrders", async (req, res) => {
      const data = req.body;
      const result = await userOrderCollection.insertOne(data);
      res.send(result);
    });
    app.get("/userOrders", verifyToken, async (req, res) => {
      const email = req.query.email;
      const decoded = req.decoded.email;

      if (email !== decoded) {
        return res.status(403).send({ message: "forbidden access" });
      } else {
        const query = { email: email };
        const result = await userOrderCollection.find(query).toArray();
        res.send(result);
      }
    });
    app.post("/users", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.put("/user/seller/", verifyToken, async (req, res) => {
      const email = req.query.email;
      const userType = req.query.userType;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          userType: userType,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    app.get("/allUser", async (req, res) => {
      const userType = req.query.userType;
      if (userType === userType) {
        const query = { userType: userType };
        const allUser = await userCollection.find(query).toArray();
        res.send(allUser);
      } else if (userType === userType) {
        const query = { userType: userType };
        const allUser = await userCollection.find(query).toArray();
        res.send(allUser);
      }
    });
    app.get("/user/seller/", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send({ isSeller: user?.userType === "seller" });
    });
    // app.put("/user/admin/", verifyToken, async (req, res) => {
    //   const email = req.query.email;
    //   const role = req.query.role;
    //   const filter = { email: email };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       role: role,
    //     },
    //   };
    //   const result = await userCollection.updateOne(filter, updateDoc, options);
    //   res.send(result);
    // });
    app.get("/user/admin/", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
  } catch (error) {
    console.log(error);
  }
}
run().catch((error) => console.log(error.message));

app.listen(port);
