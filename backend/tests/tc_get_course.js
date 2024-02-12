const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

describe('Get Course by Admin Endpoint', () => {
    let adminToken;

    before(async () => {
        // Login as admin to obtain token
        const loginResponse = await chai.request("http://localhost:3001")
            .post('/auth/login') // Replace with your actual login endpoint
            .send({
                username: 'adminuser', // Replace with actual admin username
                password: 'adminPassword' // Replace with actual admin password
            });

        expect(loginResponse).to.have.status(200);
        adminToken = loginResponse.body.token; // Extract token
    });

    it('should successfully retrieve course details for an admin user', (done) => {
        chai.request("http://localhost:3001")
            .get('/admin/course/get')
            .query({ course_id: 1 }) // Adjust as needed
            .set('Authorization', `Bearer ${adminToken}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Course details are returned.');
                expect(res.body.course).to.be.an('object');

                // Assertions for specific fields in the course object
                expect(res.body.course).to.have.property('course_id', 1);
                expect(res.body.course).to.have.property('course_code', 'CSC101'); // Replace with expected value
                expect(res.body.course).to.have.property('course_session', '2023S'); // Replace with expected value
                expect(res.body.course).to.have.property('gitlab_group_id', '123'); // Replace with expected value
                expect(res.body.course).to.have.property('default_token_count', 10); // Replace with expected number
                expect(res.body.course).to.have.property('token_length', 6); // Replace with expected number
                expect(res.body.course).to.have.property('hidden', false); // Replace with expected boolean

                done();
            });
    });

    // Additional tests for error cases can be added here

    after(async () => {
        // Cleanup if necessary
    });
});
