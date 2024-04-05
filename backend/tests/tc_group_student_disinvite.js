// test/group/disinvite.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");

chai.use(chaiHttp);
const expect = chai.expect;

const disinviteEndpoint = (course_id) => {
    return `/course/${course_id}/group/disinvite`;
};

describe('[group/disinvite module]: DELETE disinvite endpoint', () => {
    let cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should disinvite a student successfully', (done) => {
        chai.request(BASE_API_URL)
            .delete(disinviteEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({ username: "cscstudentuser2", task: "Task1" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You have cancelled the invitation.');
                done();
            });
    });

    it('should return an error if the student is not invited', (done) => {
        chai.request(BASE_API_URL)
            .delete(disinviteEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({ username: "studentnogroup" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('should return an error if the invitation does not exist', (done) => {
        chai.request(BASE_API_URL)
            .delete(disinviteEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({ username: "studentnogroup", task: "Task1"  })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invitation doesn\'t exist.');
                done();
            });
    });

    after(async () => {
    });
});
