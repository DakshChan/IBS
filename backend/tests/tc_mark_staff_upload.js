const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to upload marks.
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/mark/upload/`}
 */
const uploadMarkEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/mark/upload`;
};

function getTestDataFilePath(filename) {
    return `${__dirname}/test-data/${filename}`;
}

// Define the markPayload for testing
const uploadPayload = {
    task: 'Assignment-1', // Ensure task name matches exactly with the one seeded in the database
    overwrite: 'true',
};

describe('Submit Mark Endpoint', () => {
    let cscInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentuserA', 'password');
    });

    it('Upload a csv with student marks as an instructor. 8 marks are added.', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadMarkEndpoint(1))
            .field('task', 'Assignment-1')
            .field('overwrite', 'true')
            .attach('file', getTestDataFilePath('marks.csv'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', '8 marks are changed. 0 marks are unchanged.');
                done();
            });
    });

    it('Upload an empty csv as an instructor.', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadMarkEndpoint(1))
            .field('task', 'Assignment-1')
            .field('overwrite', 'true')
            .attach('file', getTestDataFilePath('empty.csv'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'At least one criteria is required.');
                done();
            });
    });

    it('Upload a csv with an invalid criteria as an instructor.', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadMarkEndpoint(1))
            .field('task', 'Assignment-1')
            .field('overwrite', 'true')
            .attach('file', getTestDataFilePath('invalid_criteria.csv'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Criteria Free Marks is not found in the database.');
                done();
            });
    });

    it('Upload a csv with criteria, but with no student marks as an instructor.', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadMarkEndpoint(1))
            .field('task', 'Assignment-1')
            .field('overwrite', 'true')
            .attach('file', getTestDataFilePath('no_marks.csv'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The file must contain at least 1 valid mark.');
                done();
            });
    });

    it('Upload a csv, but without the task field as an instructor.', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadMarkEndpoint(1))
            .field('overwrite', 'true')
            .attach('file', getTestDataFilePath('marks.csv'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('Upload a non csv file as an instructor.', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadMarkEndpoint(1))
            .field('task', 'Assignment-1')
            .field('overwrite', 'true')
            .attach('file', getTestDataFilePath('cra.zip'))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The file must be a csv file.');
                done();
            });
    });

    it('Upload a csv as a student.', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadMarkEndpoint(1))
            .field('task', 'Assignment-1')
            .field('overwrite', 'true')
            .attach('file', getTestDataFilePath('marks.csv'))
            .set('Authorization', cscStudentAToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

});