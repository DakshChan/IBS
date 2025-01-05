const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const sequelize = require('../helpers/database');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");

chai.use(chaiHttp);
const expect = chai.expect;

const checkSubmissionEndpoint = (course_id, task_id) => {
    return `/course/${course_id}/submission/check?task=${task_id}`;
};

describe('Check Submission Endpoint', () => {
    let cscStudentToken, cscStudent2Token;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
    });


    it('should return submission details if the student has joined a group and there is a submission', (done) => {
        chai.request(BASE_API_URL)
            .get(checkSubmissionEndpoint(1, 1))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('before_due_date');
                done();
            });
    });
    it('should return no submission details if there are no submissions for the group', (done) => {
        chai.request(BASE_API_URL)
            .get(checkSubmissionEndpoint(1, 2))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('before_due_date');
                expect(res.body).to.not.have.property('collected');
                done();
            });
    });
    it('should return an error message if the student has not joined any group', (done) => {
        chai.request(BASE_API_URL)
            .get(checkSubmissionEndpoint(1, 1))
            .set('Authorization', cscStudent2Token)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal('You need to join a group before checking your submission.');
                done();
            });
    });
});
