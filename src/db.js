import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);

client.connect()
.then((result) => console.log("Connected successfully to database"))
.catch((err) => console.log("Error connecting to database"));

export default client;