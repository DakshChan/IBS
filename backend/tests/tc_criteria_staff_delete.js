const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to delete criteria given course_id
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/criteria/delete`}
 */
const deleteCriteriaEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/criteria/delete`;
};

payload_list = [
    {
        criteria_id: 1,
    },
    {
        criteria_id: 2,
    },
    {
        criteria_id: 3,
    }
]

describe('[criteria/staff module]: DELETE criteria endpoint', () => {
    let cscInstructorToken, cscStudentToken, matInstructorToken;
    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
    });

    it('csc instructor should be able to delete criteria that does have a mark.', (done) => {
        chai.request(BASE_API_URL)
            .delete(deleteCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload_list[0])
            .end((err, res) => {
                console.log(res.body.error);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The criteria is deleted.');
                done();
            });
    });

    it('csc instructor should be able to delete criteria that doesnt have a mark.', (done) => {
        chai.request(BASE_API_URL)
            .delete(deleteCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload_list[2])
            .end((err, res) => {
                console.log(res.body.error);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The criteria is deleted.');
                done();
            });
    });

    it('csc student should not be able to delete any criteria.', (done) => {
        chai.request(BASE_API_URL)
            .delete(deleteCriteriaEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send(payload_list[1])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('mat instructor should not be able to delete any criteria.', (done) => {
        chai.request(BASE_API_URL)
            .delete(deleteCriteriaEndpoint(1))
            .set('Authorization', matInstructorToken)
            .send(payload_list[1])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('An error should return when csc instructor deletes a criteria with a non-existent criteria id', (done) => {
        const nonExistentCriteria = {
            criteria_id: 100
        };

        chai.request(BASE_API_URL)
            .delete(deleteCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(nonExistentCriteria)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The criteria id is invalid.');
                done();
            });
    });

    it('An error should return when csc instructor deletes criteria to a non-existent course.', (done) => {
        chai.request(BASE_API_URL)
            .delete(deleteCriteriaEndpoint(100))
            .set('Authorization', cscInstructorToken)
            .send(payload_list[1])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    after(async () => {
        // Add cleanup logic if needed
    });
});