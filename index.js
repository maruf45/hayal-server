const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");

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
    if(!authHeader){
        return  res.status(401).send('unauthorized acces')

    }
    const token = authHeader.split(' ')[2];
    jwt.verfy(token, process.env.ACCES_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden acces'})
        }
        req.decoded = decoded;
        next()
    })

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
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCES_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accesToken: token });
      }
      res.status(403).send({ accesToken: "" });
    });
    app.get("/userdCars", async (req, res) => {
      const query = {};
      const result = await carCollection.find(query).toArray();
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
    app.get("/userOrders",verifyToken, async (req, res) => {
      const email = req.query.email;
      const decoded = req.decoded.email;
      if(email !== decoded){
        return res.status(403).send({massgae: 'forbidden acces'})
      }
      const query = { email: email };
      const result = await userOrderCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
}
run().catch((error) => console.log(error.message));

app.listen(port);
