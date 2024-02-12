
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure
chai.use(chaiHttp);
const expect = chai.expect;

describe('Registration Endpoint', () => {
    beforeEach(async () => {
    });

    it('should successfully register a new admin user', (done) => {
        chai
            .request("http://localhost:3001")
            .post('/auth/register/')
            .send({"username":"admin", "password": "password", "email": "admin@gmail.com", "admin": "true"})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The user is added.');
                done();
            });
    });

    it('should successfully register a new regular user', (done) => {
        chai
            .request("http://localhost:3001")
            .post('/auth/register/')
            .send({"username":"user1", "password": "password", "email": "user1@gmail.com"})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The user is added.');
                done();
            });
    });

    it('should reject registration of an existing user', (done) => {
        chai
            .request("http://localhost:3001")
            .post('/auth/register/')
            .send({"username":"user2", "password": "password", "email": "user2@gmail.com"})
            .end(() => {
                chai.request("http://localhost:3001")
                    .post('/auth/register/')
                    .send({"username":"user2", "password": "password", "email": "user2@gmail.com"})
                    .end((err, res) => {
                        expect(res).to.have.status(409); // Check for status 409 (Conflict)
                        expect(res.body).to.have.property('message', 'Username has been taken.');
                        done();
                    });
            });
    });

    after(async () => {
    });
});
