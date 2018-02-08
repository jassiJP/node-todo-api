const {ObjectID} = require('mongodb');
const {Todo} = require('../../models/todo.model');
const {User} = require('../../models/user.model');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

var users = [{
    _id: userOneId,
    email: 'jatinder@exm.com',
    password: 'somepass123',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'some@exp.com',
    password: 'somepass321'
}]

var todos = [{
    _id: new ObjectID(),
    text: 'first todo test'
}, {
    _id: new ObjectID(),
    text: 'first todo test1'
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};