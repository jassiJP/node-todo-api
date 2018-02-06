const {ObjectID} = require('mongodb');

const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo.model');

// testing lifecyle hook: this will run before any test case
// we are removing all the docs from a collection Todos

var todos = [{
    _id: new ObjectID(),
    text: 'first todo test'
}, {
    _id: new ObjectID(),
    text: 'first todo test1'
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new Todo', (done) => {
        var text = 'Text to do something';

        request(app)
            .post('/todos')
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
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });

    describe('GET /todos/:id', () => {
        it('should fetch Todo by id', (done) => {
            var id = todos[0]._id.toHexString();
            request(app)
                .get(`/todos/${id}`)
                .expect(200)
                .expect((res) => {             
                    expect(res.body.todo.text).toBe(todos[0].text);
                })
                .end(done);
        });

        it('should return 404 if ID is not valid', (done) => {

            var id = '123ljh';

            request(app)
                .get(`/todos/${id}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 if ID does not exist', (done) => {
            var id = new ObjectID().toHexString();

            request(app)
                .get(`/todos/${id}`)
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
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should return 404 if ID is not found', (done) => {
        var id = new ObjectID();

        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if ID is invalid', (done) => {
        request(app)
            .delete('/todos/23d')
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

        request(app)
            .patch(`/todos/${id}`)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(body.completed);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo.text).toBeTruthy();
                    expect(todo.completed).toBeTruthy();
                    expect(todo.completedAt).toBeA('number');
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

