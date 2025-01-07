const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { BASE_API_URL } = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers");

chai.use(chaiHttp);
const expect = chai.expect;

const leaveGroupEndpoint = (course_id) => {
    return `/course/${course_id}/group/leave`;
};

describe('Leave Group Endpoint', () => {
    let cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should leave the group successfully and return 200 status code', (done) => {
        chai.request(BASE_API_URL)
            .delete(leaveGroupEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({ task: 'Task1' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You have left the group.');
                done();
            });
    });

    it('should return 400 status code when user is not in the group', (done) => {
        chai.request(BASE_API_URL)
            .delete(leaveGroupEndpoint(1))
            .set('Authorization', studentNoGroupToken)
            .send({ task: 'Task1' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'You were not in the group.');
                done();
            });
    });

    // Add more test cases as needed
});
