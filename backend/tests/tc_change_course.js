const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

describe('Change Course Endpoint', () => {
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

    it('should successfully update course details', async () => {
        const response = await chai.request("http://localhost:3001")
            .put('/admin/course/change')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 1, // Assuming '1' is the ID of the seeded course
                course_code: "CSC103",
                course_session: "2023F",
                gitlab_group_id: "125",
                default_token_count: 12,
                token_length: 8,
                hidden: true
            });

        expect(response).to.have.status(200);
        expect(response.body).to.have.property('message', 'The course is changed.');
    });

    it('should fail to update due to non-unique course code', async () => {
        const response = await chai.request("http://localhost:3001")
            .put('/admin/course/change')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 1, // Assuming '1' is the ID of the seeded course
                course_code: "CSC102", // Assuming this code already exists for another course
                course_session: "2023F",
                gitlab_group_id: "126",
                default_token_count: 12,
                token_length: 8,
                hidden: true
            });

        expect(response).to.have.status(409);
        expect(response.body).to.have.property('message', 'The course must have unique course code and session.');
    });

    it('should fail to update due to invalid course id', async () => {
        const response = await chai.request("http://localhost:3001")
            .put('/admin/course/change')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 9999, // Assuming this ID does not exist
                course_code: "CSC999",
                course_session: "2023F",
                gitlab_group_id: "125",
                default_token_count: 15,
                token_length: 10,
                hidden: true
            });

        expect(response).to.have.status(400);
        expect(response.body).to.have.property('message', 'The course id is invalid.');
    });

    after(async () => {
        // Cleanup if necessary
    });
});
