const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {getAuthBearerToken, checkPropertiesExist} = require("./utils/helpers");
const {BASE_API_URL} = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all task groups given role and course id
 * @param course_id the id of the course
 * @returns {`/course/${string}/task/all`}
 */
const allTaskEndpoint = (course_id) => {
    return `/course/${course_id}/task/all`;
};

// Expected Attributes of the Payload
const props = [
    'long_name',
    'due_date',
    'weight',
    'hidden',
    'min_member',
    'max_member',
    'max_token',
    'hide_interview',
    'hide_file',
    'change_group',
    'interview_group',
    'task_group_id',
    'starter_code_url'
];

describe('[task/student module]: GET all task endpoint', () => {
    let cscInstructorToken, cscStudentToken, matStudentToken;
    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        matStudentToken = await getAuthBearerToken('matstudentuser', 'password');
    });

    it('csc student should be able to get task 1', (done) => {
        chai.request(BASE_API_URL)
            .get(allTaskEndpoint(1))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.tasks).to.be.an('array');
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.equal(3); // 3 Tasks shown in seeder file

                res.body.tasks.forEach((task) => {
                    checkPropertiesExist(task, props);
                });
            })
        done();
    });

    it('mat student should not be able to get tasks for course_id 1', (done) => {
        chai.request(BASE_API_URL)
            .get(allTaskEndpoint(1))
            .set('Authorization', matStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(403);
            })
        done();
    });

    it('should return an error for an incorrect course ID', (done) => {
        chai.request(BASE_API_URL)
            .get(allTaskEndpoint(100))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });
    });

    after(async () => {
    });
});
