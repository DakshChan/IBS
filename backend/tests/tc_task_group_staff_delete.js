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
 * Constructs the endpoint to delete a task group as the given role for the
 * course with given course id
 * @param role one of the values in ./constants.js ROLES
 * @param course_id the id of the course
 * @returns {`/${string}/course/${string}/task_group/delete`}
 */
const deleteTaskGroupEndpoint = (role, course_id) => {
    return `/${role}/course/${course_id}/task_group/delete`;
};

describe('[task_group/staff module]: DELETE task group endpoint', () => {
    let matInstructorToken, cscInstructorToken, cscStudentToken;

    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');

        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
    });

    it('instructor should be be able to delete a task group', (done) => {
        chai.request(BASE_API_URL)
            .delete(deleteTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .send({ task_group_id: 1 }) // random id
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('deleting non-existent task group errors', (done) => {
        const random_task_group_id = 1000 + Math.random() * 10000 // randnum in range [1000, 10000]
        chai.request(BASE_API_URL)
            .delete(deleteTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .send({ task_group_id: random_task_group_id })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('student cannot delete task group', (done) => {
        chai.request(BASE_API_URL)
            .delete(deleteTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscStudentToken)
            .send({ task_group_id: 2 }) // random id
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('instructor cannot delete task group for different course', (done) => {
        chai.request(BASE_API_URL)
            .delete(deleteTaskGroupEndpoint(ROLES.instructor, 1))
            .set('Authorization', matInstructorToken)
            .send({ task_group_id: 3 }) // random id
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    after(async () => {
    });
});
