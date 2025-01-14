const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());


//connecting with mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.dwhia.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db('tourismDB').collection('users');
    const tourCollection = client.db('tourismDB').collection('tourSpots');

    // admin api
    app.post('/tourSpots', async (req, res) => {
      const newTour = req.body;
      console.log(newTour);
      const result = await tourCollection.insertOne(newTour); // The data (newCoffee) is inserted as a new document into the 'coffee' collection.
      res.send(result); //server response
    })

    app.get('/topSpots', async (req, res) => {
      const cursor = tourCollection.find();
      const result = await cursor.toArray();
      res.send(result); // server response
    })

    // Get a specific spot by ID
    app.get('/topSpots/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }; // Ensure you use ObjectId for MongoDB queries
      const result = await tourCollection.findOne(query);
      if (result) {
          res.send(result);
      } else {
          res.status(404).send({ message: "Spot not found" });
      }
    });

    // users API
    app.post("/users", async (req, res) => {
        const newUser = req.body;
        console.log(newUser);
        const result = await usersCollection.insertOne(newUser); // The data (newCoffee) is inserted as a new document into the 'coffee' collection.
        res.send(result); //server response
    });


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Tourism Server is running successfully')
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})