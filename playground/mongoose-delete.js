const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo.model');
const {User} = require('../server/models/user.model');

//This will not return the deleted documents
// Todo.remove({}).then((result) => {
//     console.log(result);
// });

//This will also return the deleted document
//findOneAndRemove() and findByIdAndRemove()

Todo.findByIdAndRemove('5a78d7168c7db51b20a50edc').then((todo) => {
    console.log(todo);
});