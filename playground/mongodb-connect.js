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

//     db.collection('Todos').insertOne({
//         text: 'Something to do',
//         completed: false
//     }, (err, result) => {
//         if (err) {
//             return console.log('Unable to insert Todo', err);
//         }
//         console.log( JSON.stringify(result.ops, undefined, 2) );
//     });

   db.collection('Users').insertOne({
        name: 'Jatinder',
        age: 30,
        location: 'India'
    }, (err, result) => {
        if (err) {
            return console.log('Unable to insert user', err);
        }

        console.log( JSON.stringify(result.ops, undefined, 2) )
    });

     client.close();
});
