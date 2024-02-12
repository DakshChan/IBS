const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure
const { ROLES } = require("../helpers/constants")

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to modify a task group as the given role for the
 * course with given course id
 * @param role one of the values in ./constants.js ROLES
 * @param course_id the id of the course
 * @returns {`/${string}/course/${string}/task_group/change`}
 */
const modifyTaskGroupEndpoint = (role, course_id) => {
    return `/${role}/course/${course_id}/task_group/change`;
};

describe('[task_group/staff module]: PUT modify task group endpoint', () => {
    let matInstructorToken, cscInstructorToken, cscStudentToken;

    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');

        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
    });

    it('instructor should be be able to add a task group', (done) => {
        chai.request(BASE_API_URL)
            .put(modifyTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .send({ max_token: 15, task_group_id: 1 })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('task_group');
                expect(res.body.task_group).to.have.property('task_group_id');
                expect(res.body.task_group).to.have.property('max_token');
                expect(res.body.task_group.task_group_id).to.equal(1);
                expect(res.body.task_group.max_token).to.equal(15);
                done();
            });
    });

    it('student cannot modify task group tokens', (done) => {
        chai.request(BASE_API_URL)
            .put(modifyTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscStudentToken)
            .send({ max_token: 100, task_group_id: 1 })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('cannot modify task group with missing max_token', (done) => {
        chai.request(BASE_API_URL)
            .put(modifyTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .send({ task_group_id: 1 })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('cannot create task group with missing task_group_id', (done) => {
        chai.request(BASE_API_URL)
            .put(modifyTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .send({ max_token: 2 })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('instructor cannot modify task group tokens for a different course', (done) => {
        chai.request(BASE_API_URL)
            .put(modifyTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', matInstructorToken)
            .send({ max_token: 2, task_group_id: 1 })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    after(async () => {
    });
});
