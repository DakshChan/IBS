const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken, checkPropertiesExist } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to add criteria to task given the course_id
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/criteria/add`}
 */
const addCriteriaEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/criteria/add`;
};

const criteriaList = [
    {
        criteria: 'Correctness',
        total: 80,
        task: '1',
        description: 'In order to achieve a full 80/80 all test cases must pass.'
    },
    {
        criteria: 'Style',
        total: 20,
        task: '1',
        description: 'In order to achieve a full 20/20 there must be no complaints from the linter.'
    },
    {
        criteria: 'Bonus',
        total: 10,
        task: '1',
    }
]

describe('[criteria/staff module]: POST add criteria endpoint', () => {
    let cscInstructorToken, cscStudentToken, matInstructorToken;
    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
    });

    it('csc instructor should be able to add criteria to task 1 when the criteria fields are valid with an empty description field.', (done) => {
        chai.request(BASE_API_URL)
            .post(addCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(criteriaList[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The criteria is added.');
                done();
            });
    });

    it('csc instructor should be able to add criteria to task 1 when the criteria fields are valid with a non-empty description field.', (done) => {
        chai.request(BASE_API_URL)
            .post(addCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(criteriaList[2])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The criteria is added.');
                done();
            });
    });

    it('csc student should not be able to add criteria to task 1', (done) => {
        chai.request(BASE_API_URL)
            .post(addCriteriaEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send(criteriaList[1])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('mat instructor should not be able to add criteria to task 1', (done) => {
        chai.request(BASE_API_URL)
            .post(addCriteriaEndpoint(1))
            .set('Authorization', matInstructorToken)
            .send(criteriaList[1])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('An error should return when csc instructor adds criteria to task 1 with invalid attributes.', (done) => {
        const invalidCriteriaData = {
            total: 'invalid',
        };

        chai.request(BASE_API_URL)
            .post(addCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(invalidCriteriaData)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is not found in the database.');
                done();
            });
    });

    it('An error should return when csc instructor adds criteria to a non-existent task.', (done) => {
        const nonExistentTaskData = {
            criteria: 'Correctness',
            total: 80,
            task: `100`
        };

        chai.request(BASE_API_URL)
            .post(addCriteriaEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(nonExistentTaskData)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is not found in the database.');
                done();
            });
    });

    it('An error should return when csc instructor adds criteria to a non-existent course.', (done) => {
        chai.request(BASE_API_URL)
            .post(addCriteriaEndpoint(100))
            .set('Authorization', cscInstructorToken)
            .send(criteriaList[1])
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