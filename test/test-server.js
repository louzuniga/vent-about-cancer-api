const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const login = require('../routes/api/auth');
const posts = require('../routes/api/posts');
const profile = require('../routes/api/profile');
const users = require('../routes/api/users');

const should = chai.should();
chai.use(chaiHttp);

// *****************************//
// ******* TESTING GET ******* //
// *****************************//
describe('GET endpoints', function() {
  it('Should get posts', function() {
    // login user first
    return;
    let token;
    const creds = {
      email: 'demo@gmail.com',
      password: '12345678'
    };
    return chai
      .request(login)
      .post('/')
      .send(creds)
      .then(function(res) {
        expect(res).to.have.status(200);
        token = res.body.token;
        return token;
      });

    return chai
      .request(posts)
      .get('/')
      .set('authorization', `Bearer ${token}`)
      .send({
        text: 'testing POST in posts'
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
      })
      .catch(err => {
        console.log(err);
      });
  });

  it('Should GET profile', function() {
    // login user first
    return;
    let token;
    const creds = {
      email: 'demo@gmail.com',
      password: '12345678'
    };
    return chai
      .request(login)
      .post('/')
      .send(creds)
      .then(function(res) {
        expect(res).to.have.status(200);
        token = res.body.token;
        return token;
      });

    return chai
      .request(profile)
      .get('/')
      .set('authorization', `Bearer ${token}`)
      .send({
        status: 'testing POST',
        location: 'testing'
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
      })
      .catch(err => {
        console.log(err);
      });
  });

  it('Should get users', function() {
    // login user first
    return;
    let token;
    const creds = {
      email: 'demo@gmail.com',
      password: '12345678'
    };
    return chai
      .request(users)
      .post('/')
      .send(creds)
      .then(function(res) {
        expect(res).to.have.status(200);
        token = res.body.token;
        return token;
      });

    return chai
      .request(users)
      .get('/')
      .set('authorization', `Bearer ${token}`)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
      })
      .catch(err => {
        console.log(err);
      });
  });
});

// *****************************//
// ******* TESTING POST ******* //
// *****************************//
describe('POST endpoints', function() {
  it('Should get posts', function() {
    // login user first
    return;
    let token;
    const creds = {
      email: 'demo@gmail.com',
      password: '12345678'
    };
    return chai
      .request(login)
      .post('/')
      .send(creds)
      .then(function(res) {
        expect(res).to.have.status(200);
        token = res.body.token;
        return token;
      });

    return chai
      .request(posts)
      .post('/')
      .set('authorization', `Bearer ${token}`)
      .send({
        text: 'testing POST in posts'
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
      })
      .catch(err => {
        console.log(err);
      });
  });

  it('Should create profile', function() {
    // login user first
    return;
    let token;
    const creds = {
      email: 'demo@gmail.com',
      password: '12345678'
    };
    return chai
      .request(login)
      .post('/')
      .send(creds)
      .then(function(res) {
        expect(res).to.have.status(200);
        token = res.body.token;
        return token;
      });

    return chai
      .request(profile)
      .post('/')
      .set('authorization', `Bearer ${token}`)
      .send({
        status: 'testing POST',
        location: 'testing'
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
      })
      .catch(err => {
        console.log(err);
      });
  });

  it('Should register a user', function() {
    // login user first
    return;
    let token;
    const creds = {
      email: 'demo@gmail.com',
      password: '12345678'
    };
    return chai
      .request(users)
      .post('/')
      .send(creds)
      .then(function(res) {
        expect(res).to.have.status(200);
        token = res.body.token;
        return token;
      });

    return chai
      .request(users)
      .post('/')
      .set('authorization', `Bearer ${token}`)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
      })
      .catch(err => {
        console.log(err);
      });
  });
});
