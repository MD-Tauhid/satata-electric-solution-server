const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()


// middleware
app.use(cors());
app.use(express.json());


// Mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ybh5qdc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run(){
    try{
        const imageCollection = client.db("satata_electric_solution").collection("images");
        
        app.get('/images', async(req, res)=>{
            const query = {}
            const cursor = imageCollection.find(query);
            const images = await cursor.toArray();
            res.send(images);
        })
    }
    finally{

    }
}
run().catch(err => console.error(err))





app.get('/', (req, res) =>{
    res.send('Satata Electric Solution server is running');
})

app.listen(port, ()=>{
    console.log(`Electric Solution is running on: ${port}`);
})