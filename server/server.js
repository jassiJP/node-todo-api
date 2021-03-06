require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo.model');
var {User} = require('./models/user.model');
var {authenticate, login} = require('./middleware/authenticate');

var app = express();

//HEROKU: this is done so that Heroku can setup a port
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/users', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    try {
        await user.save();
        const authToken = await user.generateAuthToken();
        res.header('x-auth', authToken).send({user});
    } catch (err) {
        res.status(400).send(err);
    }

    // user.save().then(() => {
    //     return user.generateAuthToken();
    // }).then((token) => {
    //     res.header('x-auth', token).send({user});
    // }).catch((err) => {
    //     res.status(400).send(err);
    // }); 
});

app.post('/users/login', async (req, res) => {

    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (err) {
        res.status(400).send();
    }

    // User.findByCredentials(body.email, body.password).then((user) => {
    //     user.generateAuthToken().then((token) => {
    //         res.header('x-auth', token).send(user);
    //     });
    // }).catch((err) => {
    //     res.status(400).send();
    // });
});


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (err) {
        res.status(400).send();
    };

    // req.user.removeToken(req.token).then(() => {
    //     res.status(200).send();
    // }, (err) => {
    //     res.status(400).send();
    // });
});

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        //console.log('Unable to save Todo \n', err);
        res.status(400).send(err);
    });
});

app.get('/todos', authenticate, (req, res) => {
    console.log("AUTH USER: ", req.user._id);
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.status(200).send({todo});

    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;

    if( !ObjectID.isValid(id) ) {
        return res.status(404).send();
    }

    try {
        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        });

        if( !todo ) {
            return res.status(404).send();
        }
        res.send({todo});
    } catch (err) {
        res.status(400).send();
    };
    // Todo.findOneAndRemove({
    //     _id: id,
    //     _creator: req.user._id
    // }).then((todo) => {

    //     if( !todo ) {
    //         return res.status(404).send();
    //     }

    //     res.send({todo});
    // }).catch((err) => {
    //     res.status(400).send();
    // });
});

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if( !ObjectID.isValid(id) ) {
        return res.status(404).send();
    } 

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, { $set: body }, { new: true }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }, (err) => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};