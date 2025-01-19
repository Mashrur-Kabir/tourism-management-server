const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  //origin: ["http://localhost:5173"],
  origin: ["https://tourism-management-b4381.web.app"],
  credentials: true,
  optionSuccessStatus: 200,
};

//middleware
app.use(cors(corsOptions));
app.use(express.json());

//connecting with mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.dwhia.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("tourismDB").collection("users");
    const tourCollection = client.db("tourismDB").collection("tourSpots");

    // admin api
    app.post("/tourSpots", async (req, res) => {
      const newTour = req.body;
      console.log(newTour);
      const result = await tourCollection.insertOne(newTour); // The data (newCoffee) is inserted as a new document into the 'coffee' collection.
      res.send(result); //server response
    });

    app.get("/topSpots", async (req, res) => {
      const cursor = tourCollection.find();
      const result = await cursor.toArray();
      res.send(result); // server response
    });

    // Get a specific spot by ID
    app.get("/topSpots/:id", async (req, res) => {
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

    // Get spots added by a specific user
    app.get("/oneTopSpots", async (req, res) => {
      const email = req.query.email; // Extract email from query
      console.log(email);
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      try {
        const query = { user_email: email }; // Match spots added by the user
        const spots = await tourCollection.find(query).toArray();
        console.log(spots);
        res.send(spots);
      } catch (error) {
        console.error("Error fetching spots:", error);
        res.status(500).send({ message: "Failed to fetch spots" });
      }
    });

    // delete spots of that specific user
    app.delete("/delSpots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tourCollection.deleteOne(query);
      res.send(result);
    });

    // update spot of that specific user
    app.put("/updateSpot/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedSpot = req.body;
      const newSpot = {
        $set: {
          image: updatedSpot.image,
          tourists_spot_name: updatedSpot.tourists_spot_name,
          country_name: updatedSpot.country_name,
          location: updatedSpot.location,
          description: updatedSpot.description,
          average_cost: updatedSpot.average_cost,
          seasonality: updatedSpot.seasonality,
          travel_time: updatedSpot.travel_time,
          total_visitors: updatedSpot.total_visitors,
        },
      };

      const result = await tourCollection.updateOne(filter, newSpot, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tourism Server is running successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
