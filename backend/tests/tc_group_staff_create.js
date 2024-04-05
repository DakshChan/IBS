const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to create a group for a student
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/group/create`}
 */
const groupStaffCreateEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/group/create`;
};

describe('[group/staff module]: POST Create group for student', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
    });

    it('Staff can create a group for a student user', (done) => {
        chai.request(BASE_API_URL)
            .post(groupStaffCreateEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ task: "Task1", username: 'studentuser1' })
            .end((err, res) => {
                console.log(res.body)
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Group and Gitlab repo have been created. Student has been added to the Gitlab project.');
                expect(res.body).to.have.property("group_id")
                expect(res.body).to.have.property('url');
                done();
            });
    });


    it('Student that is already in a group cannot be added to another group', (done) => {
        chai.request(BASE_API_URL)
            .post(groupStaffCreateEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ task: "Task1", username: 'studentuser2' })
            .end((err, res) => {
                expect(res).to.have.status(409);
                done();
            });
    });

    it('Cannot create group for non-existent user', (done) => {
        const invalidUsername = 'no_gitlab';
        chai.request(BASE_API_URL)
            .post(groupStaffCreateEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ task: "Task1", username: invalidUsername })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message', 'The username is not found in the database.')
                done();
            });
    });


    after(async () => {
        // Add cleanup logic if needed
    });
});