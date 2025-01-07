const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all student groups
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/group/all`}
 */
const groupStaffAllEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/group/all`;
};

describe('[group/staff module]: GET all student groups for a task', () => {
    let instructorToken, student1Token, student2Token;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
        student1Token = await getAuthBearerToken('studentuser1', 'password');
        student2Token = await getAuthBearerToken('studentuser2', 'password');
    });

    it('Staff can retrieve a list of groups for a task', (done) => {
        chai.request(BASE_API_URL)
            .get(groupStaffAllEndpoint(1))
            .query({ task: 'Task1' })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 1);
                expect(res.body).to.have.property('groups');
                expect(res.body.groups).to.have.lengthOf(1);
                expect(res.body.groups[0].users).to.include("studentuser1")
                expect(res.body.groups[0].users).to.include("studentuser2")
                done();
            });
    });

    it('Must provide task name as query parameter', (done) => {
        chai.request(BASE_API_URL)
            .get(groupStaffAllEndpoint(1))
            .query({ task: '' })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('Task query parameter must be valid', (done) => {
        chai.request(BASE_API_URL)
            .get(groupStaffAllEndpoint(1))
            .query({ task: 'A_TASK_WITH_THIS_NAME_DOES_NOT_EXIST' })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    after(async () => {
        // Add cleanup logic if needed
    });
});