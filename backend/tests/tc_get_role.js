const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const expect = chai.expect;
chai.use(chaiHttp);


describe('Get Role by Admin', () => {
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

    it('should retrieve roles for a specific user', (done) => {
        chai.request('http://localhost:3001')
            .get('/admin/role/get')
            .set('Authorization', `Bearer ${adminToken}`)
            .query({ username: 'instructoruser' }) // Change as per your data
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.be.greaterThan(0);
                expect(res.body).to.have.property('role');
                expect(res.body.role).to.be.an('array');
                // Additional checks on the contents of 'role' can be added here
                done();
            });
    });

    it('should retrieve roles for a specific course', (done) => {
        chai.request('http://localhost:3001')
            .get('/admin/role/get')
            .set('Authorization', `Bearer ${adminToken}`)
            .query({ course_id: 1 }) // Change as per your data
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.be.greaterThan(0);
                expect(res.body).to.have.property('role');
                expect(res.body.role).to.be.an('array');
                // Additional checks on the contents of 'role' can be added here
                done();
            });
    });

    // Additional test cases can be added here
});
