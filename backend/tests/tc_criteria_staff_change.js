const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all criteria to task given the course_id
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/criteria/change`}
 */
const changeCriteriaEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/criteria/change`;
};

payload = {
    criteria_id: 1,
    criteria: 'Something',
    total: 10,
    description: ''
}

describe('[criteria/staff module]: POST change criteria endpoint', () => {
    let cscInstructorToken, cscStudentToken, matInstructorToken;
    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
    });

    it('csc instructor should be able to change criteria with id 1', (done) => {
        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The criteria is changed.');
                done();
            });
    });

    it('csc student should not be able to change criteria with id 1', (done) => {
        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send(payload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('mat instructor should not be able change criteria with id 1', (done) => {
        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send(payload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('An error should return when csc instructor tries to change a criteria with an incorrect course id.', (done) => {
        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(100))
            .set('Authorization', cscInstructorToken)
            .send(payload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('An error should return when csc instructor tries to change a criteria with an incorrect criteria id.', (done) => {
        bad_payload = {
            criteria_id: 100,
            criteria: 'Something',
            total: 10,
            description: ''
        }

        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(bad_payload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The criteria id is invalid.');
                done();
            });
    });

    it('An error should return when csc instructor tries to change a criteria without a description.', (done) => {
        bad_payload = {
            criteria_id: 1,
            criteria: 'Something',
            total: 10,
        }

        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(bad_payload)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The description is missing or has invalid format.');
                done();
            });
    });

    it('should return 400 if criteria_id is missing', (done) => {
        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send({
                // criteria_id is missing
                criteria: 'New Criteria',
                total: 10,
                description: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The criteria id is missing or has invalid format.');
                done();
            });
    });

    it('should return 400 if criteria_id has invalid format', (done) => {
        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send({
                criteria_id: 'invalid_id', // criteria_id has invalid format
                criteria: 'New Criteria',
                total: 10,
                description: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The criteria id is missing or has invalid format.');
                done();
            });
    });

    it('should return 400 if criteria is missing', (done) => {
        chai.request(BASE_API_URL)
            .put(changeCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send({
                criteria_id: 1,
                // criteria is missing
                total: 10,
                description: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The criteria is missing or has invalid format.');
                done();
            });
    });

    after(async () => {
        // Add cleanup logic if needed
    });
});