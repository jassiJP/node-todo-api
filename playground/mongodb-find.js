//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbname = 'TodoApp';

MongoClient.connect(url, (err, client) => {
    if (err) {
       return console.log(err, 'Unable to connect to MongoDB server');
    }

    console.log('connected to MongoDB server');

    const db = client.db(dbname);

    // db.collection('Todos').find({_id: new ObjectID('5a77580242153116616f4664')}).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log( JSON.stringify(docs, undefined, 2) );
    // }, (err) => {
    //     console.log('Unable to fetch Todos');

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch Todos', err);
    // });

    db.collection('Users').find({name: 'Jatinder'}).toArray().then((results) => {
        console.log('Docs with name Jatinder');
        console.log( JSON.stringify(results, undefined, 2) );
    }, (err) => {
        console.log('Unable to fetch Todos', err);
    });

    //client.close();
});
