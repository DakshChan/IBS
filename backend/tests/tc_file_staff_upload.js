const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");
const {DataTypes} = require("sequelize");
const os = require("os"); // Adjust the path as per your project structure
const expect = chai.expect;

chai.use(chaiHttp);

/**
 * Constructs the endpoint to upload a file for a course
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/file/upload`}
 */
const uploadFileEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/file/upload`;
};

/**
 * Gets the full path of a file in the test-data directory
 * @param fileName the name of a file in the test-data directory including extension
 * @returns {string}
 */
function getTestDataFilePath(fileName) {
    return `${__dirname}/test-data/${fileName}`;
}

describe('[file/staff module]: POST upload file endpoint', () => {
    let instructorToken;

    before(async () => {
        instructorToken = await getAuthBearerToken('instructor', 'password');
    });

    it('Staff can upload files for a specific task', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadFileEndpoint(1))
            .field('task', 'PS1')
            .attach('file', getTestDataFilePath('cra.zip'))
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The file has been uploaded.');
                done();
            });
    });

    it('File must be attached', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadFileEndpoint(1))
            .set('Authorization', instructorToken)
            .send({ task: 'PS1' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The file is missing or has invalid format.');
                done();
            });
    });

    it('File must be a zip', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadFileEndpoint(1))
            .field('task', 'PS1')
            .attach('file', getTestDataFilePath('empty-file'))
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The file must be a zip file.');
                done();
            });
    });

    it('Task must be specified', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadFileEndpoint(1))
            .attach('file', getTestDataFilePath('cra.zip'))
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });
});
