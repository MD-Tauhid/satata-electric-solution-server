const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient } = require('mongodb');
const multer = require('multer');
const path = require('path')
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


// multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/Images');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage })



// Mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ybh5qdc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
    try {
        const imageCollection = client.db("satata_electric_solution").collection("images");

        // get images from database
        app.get('/images', async (req, res) => {
            const query = {}
            const cursor = imageCollection.find(query);
            const images = await cursor.toArray();
            res.send(images);
        })

        app.post('/upload-image', upload.single("file"), (req, res) => {
            const data = req.body;
            console.log(data)
        })

    }
    finally {

    }
}
run().catch(err => console.error(err))





app.get('/', (req, res) => {
    res.send('Satata Electric Solution server is running');
})

app.listen(port, () => {
    console.log(`Electric Solution is running on: ${port}`);
})