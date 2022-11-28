const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lmouiy1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const productsCollection = client.db('vintageBooks').collection('products');
        const bookedCollection = client.db('vintageBooks').collection('booked');
        const usersCollection = client.db('vintageBooks').collection('users');

        app.get('/products', async(req, res) =>{
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        app.get('/booked', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const booked = await bookedCollection.find(query).toArray();
            res.send(booked);
        })

        app.post('/booked', async(req, res) => {
            const booked = req.body
            console.log(booked);
            const result = await bookedCollection.insertOne(booked);
            res.send(result);
        })

        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(console.log);

app.get('/', async(req, res) => {
    res.send('Vintage Books server is running...');
})

app.listen(port, () => console.log(`Doctors portal running on ${port}`))