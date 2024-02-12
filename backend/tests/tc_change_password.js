const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

describe('Change Password Endpoint', () => {
    beforeEach(async () => {
        // Setup for each test, e.g., syncing database, seeding necessary data
    });

    it('should change the password for a valid user and code', (done) => {
        chai.request("http://localhost:3001")
            .post('/auth/change_password')
            .send({ username: 'demouser', password: 'password', code: '111111' }) // Replace with valid test data
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Your password is changed.');
                done();
            });
    });

    it('should return a 400 error for missing username', (done) => {
        chai.request("http://localhost:3001")
            .post('/auth/change_password')
            .send({ password: 'newPassword', code: 'validCode' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Your username is missing.');
                done();
            });
    });

    // Additional tests for missing password, missing code, invalid username/code, etc.

    after(async () => {
        // Cleanup after tests
    });
});
