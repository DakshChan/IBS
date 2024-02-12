const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const expect = chai.expect;
chai.use(chaiHttp);

describe('Delete Role Endpoint', () => {
    let adminToken;

    before(async () => {
        // Log in as admin to obtain token
        const loginResponse = await chai.request("http://localhost:3001")
            .post('/auth/login')
            .send({
                username: 'adminuser',
                password: 'adminPassword'
            });

        expect(loginResponse).to.have.status(200);
        adminToken = loginResponse.body.token;

    });

    it('should successfully delete a specific role', async () => {
        const deleteResponse = await chai.request("http://localhost:3001")
            .delete('/admin/role/delete')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 1,
                username: 'user1'
            });

        expect(deleteResponse).to.have.status(200);
        expect(deleteResponse.body).to.have.property('message').that.includes('role is deleted');
    });

    it('should delete all roles for a course', async () => {
        const deleteAllResponse = await chai.request("http://localhost:3001")
            .delete('/admin/role/delete')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 2,
                delete_all: true
            });

        expect(deleteAllResponse).to.have.status(200);
        expect(deleteAllResponse.body).to.have.property('message').that.includes('roles are deleted');
    });

    // Add more test cases as needed
});

