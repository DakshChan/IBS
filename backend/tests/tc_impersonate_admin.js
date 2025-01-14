const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure
const {BASE_API_URL} = require("./utils/constants");
chai.use(chaiHttp);
const expect = chai.expect;
const {getAuthBearerToken} = require("./utils/helpers");

const payload = [{
    username: 'cscstudentusera'
},
{username: 'cscstudentuserb'}]

describe('Get Course by Instructor Endpoint', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken, cscStudentBToken, adminToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
        cscStudentBToken = await getAuthBearerToken('cscstudentuserb', 'password');
        adminToken = await getAuthBearerToken('adminuser', 'password');
    });

    it('should let admin impersonate a student', (done) => {
        chai.request(BASE_API_URL)
            .post('/admin/impersonate')
            .set('Authorization', adminToken).send(payload[0])
            .end((err, res) => {
                expect(res.body).to.have.property('roles');
                done();
            });
    });

    it('should let admin impersonate student in another course', (done) => {
        chai.request(BASE_API_URL)
            .post('/admin/impersonate')
            .set('Authorization', adminToken).send(payload[1])
            .end((err, res) => {
                expect(res.body).to.have.property('roles');
                done();
            });
    });

    it('should not let student impersonate', (done) => {
        chai.request(BASE_API_URL)
            .post('/admin/impersonate')
            .set('Authorization', cscStudentAToken).send(payload[1])
            .end((err, res) => {
                expect(res.body).to.have.property('message',  "You don't have permission to access.");
                done();
            });
    });

    it('should not let instructor impersonate as admin', (done) => {
        chai.request(BASE_API_URL)
            .post('/admin/impersonate')
            .set('Authorization', cscInstructorToken).send(payload[1])
            .end((err, res) => {
                expect(res.body).to.have.property('message',  "You don't have permission to access.");
                done();
            });
    });

    after(async () => {
    });
});