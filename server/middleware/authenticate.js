var {User} = require('../models/user.model');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        req.user = user;
        req.token = token;

        //res.send(user);

        next();
    }).catch((err) => {
        res.status(401).send();
    });
};

module.exports = {authenticate};