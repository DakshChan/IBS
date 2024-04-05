const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure
const { GroupUser } = require("../models");
const {getAuthBearerToken} = require("./utils/helpers");

chai.use(chaiHttp);
const expect = chai.expect;

const acceptGroupInviteEndpoint = (course_id) => {
    return `/course/${course_id}/group/accept`;
};

describe('Accept Group Invitation Endpoint', () => {
    let cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should accept group invitation for the student', (done) => {
        chai.request(BASE_API_URL)
            .put(acceptGroupInviteEndpoint(1))
            .set('Authorization', cscStudent2Token)
            .send({ task: 'Task1' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'User has been added to the group.');
                expect(res.body).to.have.property('group_id');
                expect(res.body).to.have.property('gitlab_url');
                done();
            });
    });

    it('should return an error if no task is provided', (done) => {
        chai.request(BASE_API_URL)
            .put(acceptGroupInviteEndpoint(1))
            .set('Authorization', cscStudent2Token)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('should return an error if no invitation exists for the provided task and user', (done) => {
        chai.request(BASE_API_URL)
            .put(acceptGroupInviteEndpoint(1))
            .set('Authorization', cscStudent2Token)
            .send({ task: 'Task1' }) // Assuming no invitation exists for Task1
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "Invitation doesn't exist.");
                done();
            });
    });

});
