const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");

chai.use(chaiHttp);
const expect = chai.expect;

const inviteEndpoint = (course_id) => `/course/${course_id}/group/invite`;

describe('POST /group_student_invite', () => {
    let cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should invite a user to the group', (done) => {
        chai.request(BASE_API_URL)
            .post(inviteEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({ task: "Task1", username: "studentnogroup" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'User has been invited.');
                done();
            });
    });

    it('should return an error if the username is missing in the request body', (done) => {
        chai.request(BASE_API_URL)
            .post(inviteEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({ task: "Task1" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The username is missing or has an invalid format.');
                done();
            });
    });

});
