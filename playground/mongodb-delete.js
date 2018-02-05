//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbname = 'TodoApp';

MongoClient.connect(url, (err, client) => {
    if (err) {
       return console.log(err, 'Unable to connect to MongoDB server');
    }

    console.log('connected to MongoDB server');

    var db = client.db(dbname);

    // delete many

    // db.collection('Todos').deleteMany({'text': 'eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    //delete one
    // db.collection('Todos').deleteOne({text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    //find one and delete
    // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
    //     console.log(result);
    // });

    db.collection('Users').deleteMany({name: 'Jatinder'}).then((result) => {
        console.log(`Deleted Many`);
    });

    db.collection('Users').findOneAndDelete({
        _id: new ObjectID('5a7764bf927bbe17d95d49e5')
    }).then((result) => {
        console.log('Deleted One \n', result);
    });

    //client.close();
});
