const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

describe('Add Role as Admin Endpoint', () => {
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

    it('should successfully add an instructor role to a user', (done) => {
        chai.request("http://localhost:3001")
            .post('/admin/role/add')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 1,
                username: "newinstructor",
                role: "instructor",
                update_user_info: true,
                email: "newinstructor@example.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The user is registered if needed and the role is added.');
                done();
            });
    });

    it('should successfully add a student role to a user', (done) => {
        chai.request("http://localhost:3001")
            .post('/admin/role/add')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 1,
                username: "newstudent",
                role: "student",
                update_user_info: true,
                email: "newstudent@example.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The user is registered if needed and the role is added.');
                done();
            });
    });

    it('should successfully add a TA role to a user', (done) => {
        chai.request("http://localhost:3001")
            .post('/admin/role/add')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 1,
                username: "newta",
                role: "ta",
                update_user_info: true,
                email: "newta@example.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The user is registered if needed and the role is added.');
                done();
            });
    });

    // Additional tests for error cases can be added here

    after(async () => {
        // Cleanup if necessary
    });
});
