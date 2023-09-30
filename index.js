const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient } = require('mongodb');
const multer = require('multer');
const path = require('path')
const port = process.env.PORT || 5000;


// middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'))



// multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/Images');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/png'
        ) {
            cb(null, true)
        }
        else {
            cb(null, false)
        }
    }
})


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

        app.post('/upload-image', upload.single("file"), async (req, res) => {
            const data = req.body;
            console.log(data)
            // const image = {
            //     image: data.filename
            // }
            // const result = await imageCollection.insertOne(image)
            // res.status(204).send("Successfully added the image")
        })
    }
    finally {

    }
}
run().catch(err => console.error(err))



// default error handler
app.use((err, req, res, next) => {
    if (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).send("There is an upload error!");
        }
        else {
            res.status(500).send(err.message);
        }
    }
    else {
        res.send("Success")
    }
})

app.get('/', (req, res) => {
    res.send('Satata Electric Solution server is running');
})



app.listen(port, () => {
    console.log(`Electric Solution is running on: ${port}`);
})