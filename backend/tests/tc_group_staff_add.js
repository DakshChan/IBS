const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to add a student into a group
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/group/add`}
 */
const groupStaffAddEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/group/add`;
};

describe('[group/staff module]: POST add student to group endpoint', () => {
    let instructorToken, student1Token, student2Token;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
        student1Token = await getAuthBearerToken('studentuser1', 'password');
        student2Token = await getAuthBearerToken('studentuser2', 'password');
    });

    it('Staff can add regular student to group', (done) => {
        chai.request(BASE_API_URL)
            .post(groupStaffAddEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, username: 'studentuser1' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'User has been added to the group.')
                done();
            });
    });


    it('Student that is already in a group cannot be added to another group', (done) => {
        chai.request(BASE_API_URL)
            .post(groupStaffAddEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 2, username: 'studentuser2' })
            .end((err, res) => {
                expect(res).to.have.status(409);
                done();
            });
    });

    it('Cannot add student to invalid group', (done) => {
        const invalidGroupId = -120;
        chai.request(BASE_API_URL)
            .post(groupStaffAddEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: invalidGroupId, username: 'studentuser1' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The group id is not found in the database.')
                done();
            });
    });

    it('Cannot add non-existent student to group', (done) => {
        const invalidUsername = 'doesntexist';
        chai.request(BASE_API_URL)
            .post(groupStaffAddEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, username: invalidUsername })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The username is not found in the database.')
                done();
            });
    });


    after(async () => {
        // Add cleanup logic if needed
    });
});