const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require("../app"); // Adjust the path as per your project structure
const helpers = require('../utilities/helpers'); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

describe('Verify Endpoint', () => {
    let sendEmailStub;

    beforeEach(async () => {
        // Mock the send_email function
        sendEmailStub = sinon.stub(helpers, 'send_email');
        // Setup for each test, e.g., syncing database
        // await sequelize.sync({ force: true });
    });

    afterEach(async () => {
        // Restore the original function after each test
        sendEmailStub.restore();
        // Cleanup after tests, e.g., dropping test database
        // try {
        //     await sequelize.drop();
        // } catch (error) {
        //     console.error('Error:', error);
        // }
    });

    it('should send a verification email if the username is valid', (done) => {
        chai.request("http://localhost:3001")
            .post('/auth/verify')
            .send({ username: 'demouser' }) // Replace with a valid username from your test data
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'An email has been sent if the username is valid.');
                sinon.assert.calledOnce(sendEmailStub);
                sinon.assert.calledWith(sendEmailStub, sinon.match.string, sinon.match.string, sinon.match.string);
                done();
            });
    });

    it('should return a 400 error for missing username', (done) => {
        chai.request("http://localhost:3001")
            .post('/auth/verify')
            .send({})
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Your username is missing.');
                done();
            });
    });

    // Additional tests can be added as needed
});
