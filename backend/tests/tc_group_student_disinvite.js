// test/group/disinvite.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");
const { ROLES } = require("../helpers/constants")

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to disinvite a student from a group
 * @param course_id the id of the course
 * @param task the task ID
 * @returns {string} the constructed endpoint URL
 */
const disinviteEndpoint = (course_id, task) => {
    return `/course/${course_id}/group/disinvite?task=${task}`;
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
            .delete(disinviteEndpoint(1, 1))
            .set('Authorization', cscStudentToken)
            .send({ username: "cscstudentuser2", task: "Task1" }) // Disinviting student with username 'cscstudentuser2'
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You have cancelled the invitation.');
                done();
            });
    });

    it('should return an error if the student is not invited', (done) => {
        chai.request(BASE_API_URL)
            .delete(disinviteEndpoint(1, 1))
            .set('Authorization', cscStudentToken)
            .send({ username: "studentnogroup" }) // Trying to disinvite student with username 'studentnogroup'
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('should return an error if the invitation does not exist', (done) => {
        chai.request(BASE_API_URL)
            .delete(disinviteEndpoint(1, 1))
            .set('Authorization', cscStudentToken)
            .send({ username: "studentnogroup", task: "Task1"  }) // Trying to disinvite student with username 'studentnogroup'
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invitation doesn\'t exist.');
                done();
            });
    });

    after(async () => {
        // Clean up the database after tests
        // await sequelize.sync({ force: true });
    });
});
