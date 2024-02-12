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
 * Constructs the endpoint to create a task group as the given role for the
 * course with given course id
 * @param role one of the values in ./constants.js ROLES
 * @param course_id the id of the course
 * @returns {`/${string}/course/${string}/task_group/add`}
 */
const createTaskGroupEndpoint = (role, course_id) => {
    return `/${role}/course/${course_id}/task_group/add`;
};

describe('[task_group/staff module]: POST create task group endpoint', () => {
    let matInstructorToken, cscInstructorToken, cscStudentToken;

    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');

        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
    });

    it('instructor should be be able to add a task group', (done) => {
        chai.request(BASE_API_URL)
            .post(createTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .send({ max_token: 10, name: 'problem-sets' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('cannot create task group with missing max_token', (done) => {
        chai.request(BASE_API_URL)
            .post(createTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .send({ name: 'writing-assignment' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('cannot create task group with missing name', (done) => {
        chai.request(BASE_API_URL)
            .post(createTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .send({ max_token: 2 })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('student cannot create task group', (done) => {
        chai.request(BASE_API_URL)
            .post(createTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscStudentToken)
            .send({ max_token: 5, name: 'midterm-test' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('instructor of different course cannot create task group for course', (done) => {
        chai.request(BASE_API_URL)
            .post(createTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', matInstructorToken)
            .send({ max_token: 30, name: 'tests' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    after(async () => {
    });
});
