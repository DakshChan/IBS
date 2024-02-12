const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure
chai.use(chaiHttp);
const expect = chai.expect;

const ADMIN_USER_GET_ENDPOINT = '/admin/user/get'

describe('[user/admin module]: GET endpoint', () => {
    let adminToken;
    let regularUserToken;
    before(async () => {
        adminToken = await getAuthBearerToken('adminuser', 'adminpassword');
        regularUserToken = await getAuthBearerToken('demouser1', 'password');
    });

    it('admin should be able to get themself', (done) => {
        chai.request(BASE_API_URL)
            .get(ADMIN_USER_GET_ENDPOINT)
            .set('Authorization', adminToken)
            .query({ username: 'adminuser' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count');
                expect(res.body).to.have.property('user');
                expect(res.body.count).is.equal(1);
                done();
            });
    });

    it('get all users', (done) => {
        chai.request(BASE_API_URL)
            .get(ADMIN_USER_GET_ENDPOINT)
            .set('Authorization', adminToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count');
                expect(res.body).to.have.property('user');
                expect(res.body.count).is.equal(5);
                done();
            });
    });

    it('non-existent username returns 0', (done) => {
        chai.request(BASE_API_URL)
            .get(ADMIN_USER_GET_ENDPOINT)
            .set('Authorization', adminToken)
            .query({ username: 'this-username-does-not-exist' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count');
                expect(res.body).to.have.property('user');
                expect(res.body.count).is.equal(0);
                done();
            });
    });

    it('admin should be able to get an existing user', (done) => {
        chai.request(BASE_API_URL)
            .get(ADMIN_USER_GET_ENDPOINT)
            .set('Authorization', adminToken)
            .query({ username: 'demouser1' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count');
                expect(res.body).to.have.property('user');
                expect(res.body.count).is.equal(1);
                done();
            });
    });

    it('unauthenticated request fails', (done) => {
        chai.request(BASE_API_URL)
            .get(ADMIN_USER_GET_ENDPOINT)
            .query({ username: 'demouser1' })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('message');
                expect(res.body).not.to.have.property('count');
                expect(res.body).not.to.have.property('user');
                done();
            });
    });

    it('non-admin request should fail', (done) => {
        chai.request(BASE_API_URL)
            .get(ADMIN_USER_GET_ENDPOINT)
            .set('Authorization', regularUserToken)
            .query({ username: 'demouser2' })
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('message');
                expect(res.body).not.to.have.property('count');
                expect(res.body).not.to.have.property('user');
                done();
            });
    });

    after(async () => {
    });
});
