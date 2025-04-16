import { MongoClient } from "mongodb";

let url = "mongodb+srv://frodrikandersson:gijoge44@cluster0.q8mq1.mongodb.net/";
let localURL = "mongodb://localhost:27017";

let client = new MongoClient(localURL);


let connect = async function() {
    await client.connect();
    console.log("Connected");

    let database = client.db("fsu24d");
    let products = database.collection("products");
}

connect();
