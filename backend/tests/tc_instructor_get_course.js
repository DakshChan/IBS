const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

describe('Get Course by Instructor Endpoint', () => {
    let instructorToken;

    before(async () => {
        // Login as instructor to obtain token
        const loginResponse = await chai.request("http://localhost:3001")
            .post('/auth/login') // Replace with your actual login endpoint
            .send({
                username: 'instructoruser', // Replace with actual instructor username
                password: 'instructorPassword' // Replace with actual instructor password
            });

        expect(loginResponse).to.have.status(200);
        instructorToken = loginResponse.body.token; // Extract token
    });

    it('should successfully retrieve course details for an instructor', (done) => {
        chai.request("http://localhost:3001")
            .get('/instructor/course/1/get') // Adjust as needed. '1' should be the course ID
            .set('Authorization', `Bearer ${instructorToken}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Course details are returned.');
                expect(res.body.course).to.be.an('object');

                // Assertions for specific fields in the course object
                expect(res.body.course).to.have.property('course_id', 1);
                expect(res.body.course).to.have.property('course_code'); // Add expected value if needed
                expect(res.body.course).to.have.property('course_session'); // Add expected value if needed
                // ... other assertions for course properties

                done();
            });
    });

    // Additional tests for error cases can be added here

    after(async () => {
        // Cleanup if necessary
    });
});
