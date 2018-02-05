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

    //for findOneAndUpdate chekcout 'mongodb update operators'
    // db.collection('Todos').findOneAndUpdate({
    //     //first argument is filter
    //     _id: new ObjectID('5a7842e31f0258161570886c')
    // },{
    //     // second argument is actual update
    //     $set: {
    //         completed: true
    //     }
    // }, {
    //     //third argument is options
    //     returnOriginal: false
    // }).then((result) => {
    //     console.log(result);
    // });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5a77580242153116616f4665')
    }, {
        $set: {
            name: 'Jatinder'
        },
        $inc: {age: 1}
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log( JSON.stringify(result, undefined, 2) );
    });

    //client.close();
});
