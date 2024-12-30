const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

const EXPECTED_MEMBERS = [
    { username: 'studentuser1', status: 'confirmed' },
    { username: 'studentuser2', status: 'confirmed' },
    { username: 'studentuser3', status: 'pending' }
]

/**
 * Constructs the endpoint to copy groups for one task to another
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/group/copy`}
 */
const groupStaffCopyEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/group/copy`;
};

describe('[group/staff module]: POST Copy groups for new task', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
    });

    it('Staff can copy groups', (done) => {
        chai.request(BASE_API_URL)
            .post(groupStaffCopyEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ from_task: "Task1", to_task: "Task2" })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('message', 'Groups have been copied successfully.');
                done();
            });
    });

    it('Original and new tasks are required', (done) => {
        chai.request(BASE_API_URL)
            .post(groupStaffCopyEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ })
            .end((err, res) => {
                expect(res).to.have.status(400)
                // expect(res.body).to.have.property('group_id', 1);
                done();
            });
    });

    after(async () => {
        // Add cleanup logic if needed
    });
});