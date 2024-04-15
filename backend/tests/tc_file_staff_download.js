const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");
const {DataTypes} = require("sequelize");
const expect = chai.expect;

chai.use(chaiHttp);

/**
 * Constructs the endpoint to delete a file for a course
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/file/delete`}
 */
const deleteFileEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/file/delete`;
};

/**
 * Constructs the endpoint to download files for a course
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/file/download`}
 */
const downloadFileEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/file/download`;
};

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


describe('[file/staff module]: GET download files endpoint', () => {
    let instructorToken;

    before(async () => {
        instructorToken = await getAuthBearerToken('instructor', 'password');
    });

    it('Staff can download files for a specific task', (done) => {
        chai.request(BASE_API_URL)
            .post(uploadFileEndpoint(1))
            .field('task', 'PS1')
            .attach('file', getTestDataFilePath('cra.zip'))
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The file has been uploaded.');

                chai.request(BASE_API_URL)
                    .get(downloadFileEndpoint(1))
                    .query({ task: 'PS1' })
                    .set('Authorization', instructorToken)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.header).to.have.property('content-disposition', 'attachment; filename=PS1.zip')

                        // Teardown
                        chai.request(BASE_API_URL)
                            .delete(deleteFileEndpoint(1))
                            .set('Authorization', instructorToken)
                            .send({ task: 'PS1' })
                            .end((err, res) => {
                                expect(res).to.have.status(200);
                                expect(res.body).to.have.property('message', 'All files have been deleted.');
                                done();
                            });
                    });

            });
    });

    it("Notify if task has no associated files", (done) => {
        chai.request(BASE_API_URL)
            .get(downloadFileEndpoint(1))
            .set('Authorization', instructorToken)
            .query({ task: 'PS2' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'This task has no file.');
                done();
            });
    });

    it("Task must be valid", (done) => {
        chai.request(BASE_API_URL)
            .get(downloadFileEndpoint(1))
            .set('Authorization', instructorToken)
            .query({ task: 'doesntexist' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it("Task must be provided", (done) => {
        chai.request(BASE_API_URL)
            .get(downloadFileEndpoint(1))
            .set('Authorization', instructorToken)
            .query({ })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

});
