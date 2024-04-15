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
 * Constructs the endpoint to remove a user from a group
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/group/remove`}
 */
const groupStaffRemoveEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/group/remove`;
};

describe('[group/staff module]: DELETE remove student from group', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
    });

    it('Staff can remove a student from a group', (done) => {
        chai.request(BASE_API_URL)
            .delete(groupStaffRemoveEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, username: 'studentuser2' })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('message', 'The student is removed from the group.');
                done();
            });
    });

    it("Cannot remove a student from a group they don't belong to", (done) => {
        chai.request(BASE_API_URL)
            .delete(groupStaffRemoveEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, username: 'grouplessstudentuser' })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.have.property('message', 'The student was not in the group.');
                done();
            });
    });

    it('group_id and username are required', (done) => {
        chai.request(BASE_API_URL)
            .delete(groupStaffRemoveEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.have.property('message');
                done();
            });
    });

    after(async () => {
        // Add cleanup logic if needed
    });
});