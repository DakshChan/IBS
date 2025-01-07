// test/rejectGroupInvite.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");

chai.use(chaiHttp);
const expect = chai.expect;
const rejectGroupInviteEndpoint = (course_id) => {
    return `/course/${course_id}/group/reject`;
};

describe('Reject Group Invite Endpoint', () => {
    let cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should reject group invite for a student', (done) => {
        chai.request(BASE_API_URL)
            .delete(rejectGroupInviteEndpoint(1))
            .set('Authorization', cscStudent2Token)
            .send({ task: "Task1" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You have rejected the invitation.');
                done();
            });
    });

    it('should return error if invitation does not exist', (done) => {
        chai.request(BASE_API_URL)
            .delete(rejectGroupInviteEndpoint(1))
            .set('Authorization', cscStudent2Token)
            .send({ task: "Task1" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invitation doesn\'t exist.');
                done();
            });
    });
    // Add more test cases as needed

    after(async () => {
    });
});
