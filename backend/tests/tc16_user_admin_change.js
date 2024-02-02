const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure
chai.use(chaiHttp);
const expect = chai.expect;

const ADMIN_USER_CHANGE_ENDPOINT = '/admin/user/change'

describe('[user/admin/change module]: PUT endpoint', () => {
    let adminToken;
    let regularUserToken;
    before(async () => {
        adminToken = await getAuthBearerToken('adminuser', 'adminpassword');
        regularUserToken = await getAuthBearerToken('demouser1', 'password');
    });

    it('admin should be able to change their own email', (done) => {
        const new_admin_email = "new_admin_email@example.com";
        const admin_username = "adminuser";
        chai.request(BASE_API_URL)
            .put(ADMIN_USER_CHANGE_ENDPOINT)
            .set('Authorization', adminToken)
            .send({ username: admin_username,  email: new_admin_email })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should be able to change another users email', (done) => {
        const new_demo1_email = 'new_demouser1_email@example.com';
        const demo_username = 'demouser1'
        chai.request(BASE_API_URL)
            .put(ADMIN_USER_CHANGE_ENDPOINT)
            .set('Authorization', adminToken)
            .send({ username: demo_username,  email: new_demo1_email })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('unauthenticated request fails', (done) => {
        chai.request(BASE_API_URL)
            .put(ADMIN_USER_CHANGE_ENDPOINT)
            .send({ username: 'demouser2',  email: 'demouser2@example.com' })
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    it('non-admin request should fail', (done) => {
        chai.request(BASE_API_URL)
            .get(ADMIN_USER_CHANGE_ENDPOINT)
            .set('Authorization', regularUserToken)
            .query({ username: 'demouser2' })
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });
    });

    after(async () => {
    });
});
