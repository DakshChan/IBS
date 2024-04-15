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
 * Constructs the endpoint to modify a groups extension
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/group/extension`}
 */
const groupStaffExtensionEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/group/extension`;
};

describe('[group/staff module]: PUT modify extensions for groups', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
    });

    it('Staff can give a group an extension', (done) => {
        chai.request(BASE_API_URL)
            .put(groupStaffExtensionEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, extension: 20 })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('message', 'The extension is changed.');
                done();
            });
    });

    it('group_id and extension are required', (done) => {
        chai.request(BASE_API_URL)
            .put(groupStaffExtensionEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.have.property('message');
                done();
            });
    });

    it('group_id must exist', (done) => {
        chai.request(BASE_API_URL)
            .put(groupStaffExtensionEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 10000, extension: 50 })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.have.property('message', "The group id doesn't exist.");
                done();
            });
    });

    after(async () => {
        // Add cleanup logic if needed
    });
});