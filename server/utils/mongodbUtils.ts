import { Db, MongoClient, ServerApiVersion } from "mongodb";

const envUsername = process.env.MONGODB_USERNAME;
const envPassword = process.env.MONGODB_PASSWORD;
const connectionString = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE;
console.log("ENV:", process.env.toString());

let uri = "";

if ((!envUsername && !envPassword) || (!databaseName && !connectionString)) {
  console.error("Please provide a username and password for MongoDB");
  process.exit(1);
}

if (connectionString) {
  uri = connectionString;
} else {
  uri =
    "mongodb+srv://" +
    envUsername +
    ":" +
    envPassword +
    "@cluster.4ytir.mongodb.net/?retryWrites=true&w=majority&appName=cluster";
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

async function run() {
  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
run().catch(console.dir);

//When nodejs/shutdown
process.on("SIGINT", async () => {
  console.log("Closing MongoDB connection");
  await client.close();
});

const database = client.db(databaseName);

export default database as Db;
