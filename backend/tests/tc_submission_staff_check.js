const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const sequelize = require('../helpers/database');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");

chai.use(chaiHttp);
const expect = chai.expect;

const checkSubmissionEndpoint = (course_id, task_id, username) => {
    return `/instructor/course/${course_id}/submission/check?task=${task_id}&username=${username}`;
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
            .get(checkSubmissionEndpoint(1, 1, 'instructoruser'))
            .set('Authorization', instructorToken)
            .send({ task: 1, username: 'cscstudentuser', group_id: 1 })
            .end((err, res) => {
                // console.log(res.body)
                expect(res).to.have.status(200);
                const before_due_date = res.body.before_due_date;
                expect(before_due_date).to.have.property('group_id');
                expect(before_due_date).to.have.property('task');
                expect(before_due_date).to.have.property('due_date');
                expect(before_due_date).to.have.property('due_date_with_extension');
                expect(before_due_date).to.have.property('due_date_with_extension_and_token');
                expect(before_due_date).to.have.property('max_token');
                expect(before_due_date).to.have.property('token_length');
                expect(before_due_date).to.have.property('commit_id');
                expect(before_due_date).to.have.property('commit_time');
                expect(before_due_date).to.have.property('push_time');
                expect(before_due_date).to.have.property('commit_message');
                expect(before_due_date).to.have.property('token_used');
                expect(res.body.collected).to.have.property('commit_id');
                expect(res.body.collected).to.have.property('token_used');
                done();
            });
    });
    it('should return 400 if username is missing', (done) => {
        chai.request(BASE_API_URL)
            .get(checkSubmissionEndpoint(1, 1, 'instructoruser'))
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Missing username from the request body.');
                done();
            });
    });

});
