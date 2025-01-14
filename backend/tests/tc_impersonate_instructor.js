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
    let cscInstructorToken, matInstructorToken, cscStudentAToken, cscStudentBToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
        cscStudentBToken = await getAuthBearerToken('cscstudentuserb', 'password');
    });

    it('should let instructor impersonate a student enrolled in their course', (done) => {
        chai.request(BASE_API_URL)
            .post('/instructor/course/1/impersonate')
            .set('Authorization', cscInstructorToken).send(payload[0])
            .end((err, res) => {
                expect(res.body).to.have.property('roles');
                done();
            });
    });

    it('should not let instructor impersonate a student not enrolled in their course', (done) => {
        chai.request(BASE_API_URL)
            .post('/instructor/course/1/impersonate')
            .set('Authorization', matInstructorToken).send(payload[1])
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('should not let student impersonate', (done) => {
        chai.request(BASE_API_URL)
            .post('/instructor/course/1/impersonate')
            .set('Authorization', cscStudentAToken).send(payload[0])
            .end((err, res) => {
                expect(res.body).to.have.property('message',  'Invalid or unauthorized access to course.');
                done();
            });
    });

    after(async () => {
    });
});