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
 * Constructs the endpoint to check groups
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/group/check`}
 */
const groupStaffCheckEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/group/check`;
};

describe('[group/staff module]: GET check student groups', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
    });

    it('Staff can retrieve group information', (done) => {
        chai.request(BASE_API_URL)
            .get(groupStaffCheckEndpoint(1))
            .query({ group_id: 1 })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('group_id', 1);
                expect(res.body).to.have.property('extension', 0)
                expect(res.body).to.have.property('message', 'Group info is returned.');
                expect(res.body).to.have.property('gitlab_url')
                expect(res.body).to.have.property('members');
                expect(res.body.members).to.have.deep.members(EXPECTED_MEMBERS);
                done();
            });
    });

    it('Staff can retrieve group information for a specific student and task', (done) => {
        chai.request(BASE_API_URL)
            .get(groupStaffCheckEndpoint(1))
            .query({ task: "Task1", username: "studentuser1" })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('group_id', 1);
                expect(res.body).to.have.property('extension', 0)
                expect(res.body).to.have.property('message', 'The student has joined a group.');
                expect(res.body).to.have.property('gitlab_url')
                expect(res.body).to.have.property('members');
                expect(res.body.members).to.have.deep.members(EXPECTED_MEMBERS);

                chai.request(BASE_API_URL)
                    .get(groupStaffCheckEndpoint(1))
                    .query({ task: "Task1", username: "studentuser3" })
                    .set('Authorization', instructorToken)
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body).to.have.property('group_id', 1);
                        expect(res.body).to.have.property('message', 'The student has been invited to join a group.');
                        expect(res.body).to.have.property('members');
                        expect(res.body).not.to.have.property('extension')
                        expect(res.body).not.to.have.property('gitlab_url')
                        expect(res.body.members).to.have.deep.members(EXPECTED_MEMBERS);

                        chai.request(BASE_API_URL)
                            .get(groupStaffCheckEndpoint(1))
                            .query({ task: "Task1", username: "studentusernogroup" })
                            .set('Authorization', instructorToken)
                            .end((err, res) => {
                                expect(res).to.have.status(200)
                                expect(res.body).to.have.property('message', 'The student is not in a group.');
                                done();
                            });
                    });
            });
    });

    it('Cannot retrieve information about non-existent group', (done) => {
        const nonExistentGroupId = 10000;

        chai.request(BASE_API_URL)
            .get(groupStaffCheckEndpoint(1))
            .query({ group_id: nonExistentGroupId })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400)
                done();
            });
    });

    it('Must provide either a group id or a username', (done) => {
        const nonExistentGroupId = 10000;

        chai.request(BASE_API_URL)
            .get(groupStaffCheckEndpoint(1))
            .query({ })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Either group id or username needs to be provided.');
                done();
            });
    });

    after(async () => {
        // Add cleanup logic if needed
    });
});