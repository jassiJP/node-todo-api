const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo.model');
const {User} = require('../server/models/user.model');

var id = '5a785f70c71411091925861aa';

// if (!ObjectID.isValid(id)) {
//     console.log('ID not valid!');
// }

// Todo.find({
//     //mongoose is going to convert string id into an ObjectID
//     _id: id
// }).then((todos) => {
//     if (!todos.length) {
//         return console.log('ID not found!');
//     }
//     console.log('Todos: \n', JSON.stringify(todos, undefined, 2));
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     if (!todo) {
//         return console.log('ID not found!');
//     }
//     console.log('Todo: \n', JSON.stringify(todo, undefined, 2));
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('ID not found!');
//     }
//     console.log('Todo: \n', JSON.stringify(todo, undefined, 2));
// }).catch((err) => {
//     console.log(err);
// });

User.findById(id).then((user) => {
    if (!user) {
        return console.log('ID not found');
    } 
    console.log( JSON.stringify(user, undefined, 2) );
}).catch((err) => {
    console.log(err);
});