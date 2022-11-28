const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lmouiy1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    function verifyJWT(req, res, next){
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).send('unauthorized access');
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
            if(err){
                return res.status(403).send({message: 'forbidden access'})
            }
            req.decoded = decoded;
            next();
        })
    }

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
        app.get('/advertise', async(req, res) => {
            const query = {}
            const cursor = productsCollection.find(query);
            const services = await cursor.limit(2).toArray();
            res.send(services.reverse());
        })

        app.get('/booked', verifyJWT, async(req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'});
            }
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

        app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token})
            }
            console.log(user)
            res.status(403).send({accessToken: ''})
        })

        app.get('/users', async(req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.put('/users/admin/:id', verifyJWT, async(req, res) => {
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);

            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id)}
            const options = {upsert: true};
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
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