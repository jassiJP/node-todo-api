const {ObjectID} = require('mongodb');

const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo.model');
const {User} = require('../models/user.model');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

// testing lifecyle hook: this will run before any test case
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new Todo', (done) => {
        var text = 'Text to do something';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should not create Todo with invalid data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('GET /todos', () => {
    it('should fetch documents from Todos collection', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });

    describe('GET /todos/:id', () => {
        it('should fetch Todo by id', (done) => {
            var id = todos[0]._id.toHexString();
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth', users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {             
                    expect(res.body.todo.text).toBe(todos[0].text);
                })
                .end(done);
        });

        it('should not fetch Todo by id created by other user', (done) => {
            var id = todos[0]._id.toHexString();
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth', users[1].tokens[0].token)
                .expect(404)
                .end(done);
        });

        it('should return 404 if ID is not valid', (done) => {

            var id = '123ljh';

            request(app)
                .get(`/todos/${id}`)
                .set('x-auth', users[0].tokens[0].token)
                .expect(404)
                .end(done);
        });

        it('should return 404 if ID does not exist', (done) => {
            var id = new ObjectID().toHexString();

            request(app)
                .get(`/todos/${id}`)
                .set('x-auth', users[0].tokens[0].token)
                .expect(404)
                .end(done);
        });
    });

});

describe('DELETE /todos/:id', () => {
    it('should delete a document by ID', (done) => {
        var id = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo).toBeFalsy();
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should not delete a document by ID if not the creator', (done) => {
        var id = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo).toBeTruthy();
                    done();
                }).catch((err) => done(err));
            })
    });

    it('should return 404 if ID is not found', (done) => {
        var id = new ObjectID();

        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if ID is invalid', (done) => {
        request(app)
            .delete('/todos/23d')
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update todo by ID:completed:true and fill completedAt', (done) => {
        var id = todos[0]._id.toHexString();
        var body = {
            text: 'test update by id set completed true',
            completed: true
        };
        //auth as first user
        request(app)    
            .patch(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(body.completed);
                expect(typeof res.body.todo.completedAt).toBe('number');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo.text).toBeTruthy();
                    expect(todo.completed).toBeTruthy();
                    expect(typeof todo.completedAt).toBe('number');
                    done();
                }, (err) => done(err));
            });
    });

    it('should not update todo by ID if not the creator', (done) => {
        var id = todos[0]._id.toHexString();
        var body = {
            text: 'test update by id set completed true',
            completed: true
        };
        //auth as secomd user
        request(app)    
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send(body)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo.text).not.toBe(body.text);
                    expect(todo.completed).not.toBe(body.completed);
                    expect(typeof todo.completedAt).not.toBe('number');
                    done();
                }, (err) => done(err));
            });
    });

    it('should update todo by id: completed:false and fill completedAt with null', (done) => {
        var id = todos[0]._id.toHexString();
        var body = {
            text: 'test update by id set completed false',
            completed: false
        };

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.complete).toBeFalsy();
                expect(res.body.todo.completedAt).toBeFalsy();
                expect(res.body.todo.text).toBe(body.text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo.completed).toBeFalsy();
                    expect(todo.completedAt).toBeFalsy();
                    expect(todo.text).toBe(body.text);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('GET /users/me', () => {
    it('should return user is authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});                
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'exmp@exmp.com';
        var password = 'abc123';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body.user._id).toBeTruthy();
                expect(res.body.user.email).toBe(email);
            }).end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should return validation errors if request is invalid', (done) => {
        var email = 'some';
        var password = 'some';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email is in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: users[0].email,
                password: users[0].password
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login and return valid auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                var token = res.headers['x-auth'];
                expect(token).toBeTruthy();
            })
            .end((err, res) => {

                if (err) {
                    return done(err);
                }
                
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((err) => done(err));
                
            });

    });

    it('should not login if invalid credentials', (done) => {
        request(app)    
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password +'!'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy()
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove a token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();
            })
            .end((err, res) => {
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((err) => done(err));
            })
    });
}); 