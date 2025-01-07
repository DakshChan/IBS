const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const sequelize = require('../helpers/database');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");

chai.use(chaiHttp);
const expect = chai.expect;

const collectOneSubmissionEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/submission/collect/one`;
};
describe('Collect One Submission as Instructor Endpoint', () => {
    let instructorToken, cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should not collect any submissions as submission exists and overwrite is set to false', (done) => {
        chai.request(BASE_API_URL)
            .post(collectOneSubmissionEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, overwrite: false })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.result.message).to.equal('The new submission is not collected as an old submission is found and overwrite is false.');
                expect(res.body.result.group_id).to.equal(1);
                done();
            });
    });

    it('should not collect any submission for a valid group with overwrite set to true', (done) => {
        chai.request(BASE_API_URL)
            .post(collectOneSubmissionEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, overwrite: true })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.result.message).to.equal('The new submission is not collected as an old submission is found and overwrite is false.');
                expect(res.body.result.group_id).to.equal(1);
                done();
            });
    });

    it('should not collect any submission as due date for the group has not yet passed', (done) => {
        chai.request(BASE_API_URL)
            .post(collectOneSubmissionEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 4, overwrite: true })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.result.message).to.equal('Due date hasn\'t passed for this group.');
                expect(res.body.result.group_id).to.equal(4);
                done();
            });
    });

    it('should collect one submission for a valid group with overwrite set to true', (done) => {
        chai.request(BASE_API_URL)
            .post(collectOneSubmissionEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 3, overwrite: true })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.result.message).to.equal('The new submission is collected.');
                expect(res.body.result.group_id).to.equal(3);
                done();
            });
    });
});
