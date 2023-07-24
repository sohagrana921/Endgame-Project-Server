const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//All  middleware here
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbpicg2.mongodb.net/?retryWrites=true&w=majority`;

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
    const collegesCollection = client.db("endgameDb").collection("colleges");
    const reviewsCollection = client.db("endgameDb").collection("review");
    const researchPaperCollection = client
      .db("endgameDb")
      .collection("research-papers");
    const selectedCollegesCollection = client
      .db("endgameDb")
      .collection("selectedColleges");
    const usersCollection = client.db("endgameDb").collection("users");

    // user API
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const result = await usersCollection.findOne({
        email: req.params.email,
      });
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const body = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          photo: body.photo,
          subject: body.subject,
          phoneNumber: body.phoneNumber,
          college_name: body.college_name,
          address: body.address,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: body.name,
          subject: body.subject,
          phoneNumber: body.phoneNumber,
          address: body.address,
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // colleges data
    app.get("/colleges", async (req, res) => {
      const result = await collegesCollection.find().toArray();
      res.send(result);
    });

    // Search colleges by college name
    app.get("/colleges/search", async (req, res) => {
      const query = req.query.search; // Get the search query from the request query parameters

      try {
        let result;

        // If search query is provided, perform a case-insensitive search by college name
        if (query) {
          const searchRegex = new RegExp(query, "i");
          result = await collegesCollection
            .find({ college_name: searchRegex })
            .toArray();
        } else {
          // If no search query is provided, return all colleges
          result = await collegesCollection.find().toArray();
        }

        res.send(result);
      } catch (error) {
        console.error("Error searching colleges:", error);
        res.status(500).send({ message: "Error searching colleges" });
      }
    });
    // colleges data
    app.get("/colleges", async (req, res) => {
      const query = req.query.search; // Get the search query from the request query parameters

      try {
        let result;

        // If search query is provided, perform a case-insensitive search by college name
        if (query) {
          const searchRegex = new RegExp(query, "i");
          result = await collegesCollection
            .find({ name: searchRegex })
            .toArray();
        } else {
          // If no search query is provided, return all colleges
          result = await collegesCollection.find().toArray();
        }

        res.send(result);
      } catch (error) {
        console.error("Error searching colleges:", error);
        res.status(500).send({ message: "Error searching colleges" });
      }
    });

    // ...

    app.get("/colleges/:id", async (req, res) => {
      const id = req.params.id;

      // Check if the provided ID is a valid ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid college ID format" });
      }

      try {
        const query = { _id: new ObjectId(id) };
        const result = await collegesCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "College not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching college:", error);
        res.status(500).send({ message: "Error fetching college data" });
      }
    });

    // ...

    // review data
    app.get("/review", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });
    // research paper data
    app.get("/researchPapers", async (req, res) => {
      const result = await researchPaperCollection.find().toArray();
      res.send(result);
    });
    // selected colleges
    app.get("/selectedColleges", async (req, res) => {
      const result = await selectedCollegesCollection.find().toArray();
      res.send(result);
    });
    app.get("/selectedColleges/:email", async (req, res) => {
      const result = await selectedCollegesCollection.findOne({
        email: req.params.email,
      });
      res.send(result);
    });
    app.post("/selectedColleges", async (req, res) => {
      const college = req.body;
      const result = await selectedCollegesCollection.insertOne(college);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
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
  res.send("Lens Master is Capturing");
});

app.listen(port, () => {
  console.log(`Endgame is running on port ${port}`);
});
