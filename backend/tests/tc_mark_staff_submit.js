const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to submit marks
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/mark/submit/`}
 */
const submitMarkEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/mark/submit`;
};

const markPayload = {
    task: 'Assignment-1', // Assuming this task exists in the database
    criteria: 'Correctness', // Assuming this criteria exists for the specified task
    mark: 80, // Assuming this is the mark to be submitted
    username: 'cscstudentusera' // Assuming this is the username for which the mark is being submitted
};

describe('Submit Mark Endpoint', () => {
    let cscInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentuserA', 'password');
    });

    it('Should submit a mark successfully', (done) => {
        chai.request(BASE_API_URL)
            .post(submitMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(markPayload)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', '1 marks are changed. 0 marks are unchanged.');
                done();
            });
    });

    it('Should return an error if mark field is missing', (done) => {
        const invalidPayload = { ...markPayload };
        delete invalidPayload.mark; // Simulate missing mark
        chai.request(BASE_API_URL)
            .post(submitMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(invalidPayload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The mark is missing or has invalid format.');
                done();
            });
    });

    it('Should return an error if task field is incorrect', (done) => {
        const invalidPayload = {  ...markPayload };
        delete invalidPayload.task;
        chai.request(BASE_API_URL)
            .post(submitMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(invalidPayload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('Should return an error if the criteria does not exist for the task', (done) => {
        const invalidPayload = { ...markPayload, criteria: 'NonExistentCriteria' };
        chai.request(BASE_API_URL)
            .post(submitMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(invalidPayload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The criteria is not found in the database.');
                done();
            });
    });

    it('A student should have not be able to access this endpoint', (done) => {
        const invalidPayload = { ...markPayload, criteria: 'NonExistentCriteria' };
        chai.request(BASE_API_URL)
            .post(submitMarkEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .send(invalidPayload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

});