const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const sequelize = require('../helpers/database');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");

chai.use(chaiHttp);
const expect = chai.expect;

const downloadAllSubmissionEndpoint = (course_id, task_id) => {
    return `/instructor/course/${course_id}/submission/download?task=${task_id}`;
};

describe('Check Submission Endpoint', () => {
    let instructorToken, cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });


    it('should return submission details if submissions are available for the task', (done) => {
        chai.request(BASE_API_URL)
            .get(downloadAllSubmissionEndpoint(1, 1))
            .set('Authorization', instructorToken)
            .send({ task: 1 })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.result).to.be.an('array').that.is.not.empty;
                res.body.result.forEach(result => {
                    expect(result).to.have.property('group_name');
                    expect(result).to.have.property('group_id');
                    expect(result).to.have.property('gitlab_project_id');
                    expect(result).to.have.property('gitlab_url');
                    expect(result).to.have.property('https_clone_url');
                    expect(result).to.have.property('ssh_clone_url');
                    expect(result).to.have.property('commit_id');
                });
                done();
            });
    });
    it('should return an empty array if no submissions are available for the task', (done) => {
        chai.request(BASE_API_URL)
            .get(downloadAllSubmissionEndpoint(1, 2))
            .set('Authorization', instructorToken)
            .send({ task: 2 })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.result).to.be.an('array').that.is.not.empty;
                done();
            });
    });
    it('should return an error if the user is not authorized', (done) => {
        chai.request(BASE_API_URL)
            .get(downloadAllSubmissionEndpoint(1, 1))
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
    it('should return an error if the course ID is invalid', (done) => {
        chai.request(BASE_API_URL)
            .get(downloadAllSubmissionEndpoint('invalid_course_id', 1))
            .set('Authorization', instructorToken)
            .send({ task: 1 })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });
});
