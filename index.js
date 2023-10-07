const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient } = require('mongodb');
const multer = require('multer');
const path = require('path')
var jwt = require('jsonwebtoken');
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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        const imageCollection = client.db("satata_electric_solution").collection("images");

        // token verify
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        });

        // get images from database
        app.get('/images', async (req, res) => {
            const query = {}
            const cursor = imageCollection.find(query);
            const images = await cursor.toArray();
            res.send(images);
        })

        app.post('/upload-image', upload.single("file"), async (req, res) => {
            const data = req.file;
            const image = {
                image: data.filename
            }
            const result = await imageCollection.insertOne(image)
            res.send(result);
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