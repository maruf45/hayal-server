const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkczj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

async function run() {
    try {
      const database = client.db('CarDatabase');
      const carCollection = database.collection('UsedCars');
      const carCategories = database.collection('CarCategories');
      app.get('/userdCars', async (req, res) => {
        const query = {};
        const result = await carCollection.find(query).toArray();
        res.send(result)
      })
      app.get('/carCategories', async(req, res) => {
        const query = {};
        const result = await carCategories.find(query).toArray();
        res.send(result)
      })
      app.get('/usedCars/:categoriesName', async(req, res) =>{
        const categoriesName = req.params.categoriesName;
        const query = {carBrand: categoriesName};
        const result = await carCollection.find(query).toArray();
        res.send(result)
      })
    } catch (error) {
      console.log(error);
    }
  }
  run().catch((error) => console.log(error.message));
  
app.listen(port)
