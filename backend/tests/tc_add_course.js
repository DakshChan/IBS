const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

describe('Add Course Endpoint', () => {
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

        // Login as regular user to obtain token
        const regularUserLoginResponse = await chai.request("http://localhost:3001")
            .post('/auth/login')
            .send({
                username: 'regularuser',
                password: 'regularPassword'
            });
        expect(regularUserLoginResponse).to.have.status(200);
        regularUserToken = regularUserLoginResponse.body.token;
    });

    it('should successfully add a new course', (done) => {
        chai.request("http://localhost:3001")
            .post('/admin/course/add')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_code: "CSC101",
                course_session: "2023S",
                gitlab_group_id: 123, // Assuming this is a valid ID.
                default_token_count: 10,
                token_length: 6,
                hidden: false
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The course is added and the course specific tables have been created.');
                expect(res.body).to.have.property('course_id');
                done();
            });
    });

    // Additional tests for error cases can be added here

    it('should fail to add a new course as a non-admin', (done) => {
        chai.request("http://localhost:3001")
            .post('/admin/course/add')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .send({
                course_code: "CSC202",
                course_session: "2023F",
                gitlab_group_id: 124, // Assuming this is a valid ID.
                default_token_count: 15,
                token_length: 8,
                hidden: true
            })
            .end((err, res) => {
                expect(res).to.have.status(403); // Assuming 401 for unauthorized access
                expect(res.body).to.have.property('message', "You don't have permission to access."); // Error message
                done();
            });
    });

    after(async () => {
        // Cleanup if necessary
    });
});
