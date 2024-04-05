const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all criteria to task given the course_id
 * @param course_id id of the course
 * @param task_name name of the task
 * @returns {`/instructor/course/${string}/criteria/all?task=${string}`}
 */
const allCriteriaEndpoint = (course_id, task_name) => {
    return `/instructor/course/${course_id}/criteria/all?task=${task_name}`;
};

describe('[criteria/staff module]: GET add criteria endpoint', () => {
    let cscInstructorToken, cscStudentToken, matInstructorToken;
    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
    });

    it('csc instructor should be able to get all criteria to task 1', (done) => {
        chai.request(BASE_API_URL)
            .get(allCriteriaEndpoint(1, 'Assignment-1'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count').that.equals(3);
                done();
            });
    });

    it('csc student should not be able to get all criteria to task 1', (done) => {
        chai.request(BASE_API_URL)
            .get(allCriteriaEndpoint(1, 'Assignment-1'))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('mat instructor should not be able to get all criteria to task 1', (done) => {
        chai.request(BASE_API_URL)
            .get(allCriteriaEndpoint(1, 'Assignment-1'))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('An error should return when csc instructor enters an non-existent task.', (done) => {
        chai.request(BASE_API_URL)
            .get(allCriteriaEndpoint(1, 'Assignment-100'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The task is missing or invalid.");
                done();
            });
    });

    it('An error should return when csc instructor enters an non-existent course.', (done) => {
        chai.request(BASE_API_URL)
            .get(allCriteriaEndpoint(100, 'Assignment-1'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    after(async () => {
        // Add cleanup logic if needed
    });
});