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

        app.get('/products', async(req, res) =>{
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
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