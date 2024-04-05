const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all task groups given role and course id
 * @param course_id the id of the course
 * @param task_id id of the task
 * @returns {`/course/${string}/task/get?task=${string}`}
 */
const getTaskEndpoint = (course_id, task_id) => {
    return `/course/${course_id}/task/get?task=${task_id}`;
};

// Expected Attributes of the Payload
const props = [
    'long_name',
    'due_date',
    'due_date_utc',
    'hidden',
    'weight',
    'min_member',
    'max_member',
    'max_token',
    'change_group',
    'hide_interview',
    'hide_file',
    'interview_group',
    'task_group_id',
    'starter_code_url'
];

describe('[task/student module]: GET task endpoint', () => {
    let cscInstructorToken, cscStudentToken, matStudentToken;
    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        matStudentToken = await getAuthBearerToken('matstudentuser', 'password');
    });

    it('csc student should be able to get task 1', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskEndpoint(1, 1))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('task');

                checkPropertiesExist(res.body.task, props);
                expect(res.body.task.long_name).to.equal("Tutorial 1");
                expect(res.body.task.task_group_id).to.equal(1);
            })
        done();
    });

    it('mat student should not be able to get task 1', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskEndpoint(1, 1))
            .set('Authorization', matStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(403);
            })
        done();
    });

    it('should return an error for an incorrect course ID', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskEndpoint(100, 1))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });
    });

    it('should return an error for an incorrect task ID', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskEndpoint(1, 100))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });

    after(async () => {
    });
});
