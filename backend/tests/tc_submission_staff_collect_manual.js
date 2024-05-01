const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as necessary
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");

chai.use(chaiHttp);
const expect = chai.expect;

const manualCollectSubmissionsEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/submission/collect/manual`;
};

describe('Manually Collect Submissions as Instructor Endpoint', () => {
    let instructorToken;

    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'password');
    });

    it('should return an error if the group_id is missing', (done) => {
        chai.request(BASE_API_URL)
            .post(manualCollectSubmissionsEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ commit_id: '123abc', token_used: 2 })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('The group id missing or has invalid format.');
                done();
            });
    });

    it('should return an error if the commit_id is invalid', (done) => {
        chai.request(BASE_API_URL)
            .post(manualCollectSubmissionsEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, commit_id: '', token_used: 2 })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('The commit id is missing or has invalid format.');
                done();
            });
    });

    it('should successfully collect a submission when all parameters are valid', (done) => {
        chai.request(BASE_API_URL)
            .post(manualCollectSubmissionsEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ group_id: 1, commit_id: '123abc', token_used: 1 })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal('The submission is added.');
                done();
            });
    });
});
