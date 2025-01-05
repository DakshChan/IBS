const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const sequelize = require('../helpers/database');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");

chai.use(chaiHttp);
const expect = chai.expect;

const collectAllSubmissionsEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/submission/collect/all`;
};

describe('Collect All Submissions Endpoint', () => {
    let instructorToken;

    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
    });

    it('should fail if task is missing or invalid', (done) => {
        chai.request(BASE_API_URL)
            .post(collectAllSubmissionsEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ task: '', overwrite: true }) // Invalid task
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('The task is missing or invalid.');
                done();
            });
    });

    it('should fail if overwrite property is missing or invalid', (done) => {
        chai.request(BASE_API_URL)
            .post(collectAllSubmissionsEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ task: 'Task1', overwrite: 'invalid_boolean' }) // Invalid overwrite
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('The overwrite property is missing or invalid.');
                done();
            });
    });

    it('should collect all submissions when overwrite is true', (done) => {
        chai.request(BASE_API_URL)
            .post(collectAllSubmissionsEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ task: 'Task1', overwrite: true }) // Valid request
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.result.collected_count).equals(1);
                done();
            });
    });

    it('should skip collecting submissions when overwrite is false and submissions exist', (done) => {
        chai.request(BASE_API_URL)
            .post(collectAllSubmissionsEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ task: 'Task1', overwrite: false }) // Valid request but overwrite is false
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.result.collected_count).equals(0);
                done();
            });
    });
});
