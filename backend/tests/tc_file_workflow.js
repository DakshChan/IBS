const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");
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
 * Constructs the endpoint to get a specific file
 * @param course_id the id of the course
 * @returns {`/course/${string}/file/retrieve`}
 */
const retrieveFileEndpoint = (course_id) => {
    return `/course/${course_id}/file/retrieve`;
};

/**
 * Constructs the endpoint to get all files
 * @param course_id the id of the course
 * @returns {`/course/${string}/file/all`}
 */
const getAllFilesEndpoint = (course_id) => {
    return `/course/${course_id}/file/all`;
};

/**
 * Gets the full path of a file in the test-data directory
 * @param fileName the name of a file in the test-data directory including extension
 * @returns {string}
 */
function getTestDataFilePath(fileName) {
    return `${__dirname}/test-data/${fileName}`;
}


describe('[WORKFLOW INTEGRATION TEST]: file module', () => {
    let instructorToken, studentAndrewToken;

    before(async () => {
        instructorToken = await getAuthBearerToken('instructor', 'password');
        studentAndrewToken = await getAuthBearerToken('andrew', 'password');
    });

    it('[WORKFLOW]: Staff Upload -> Student Get File Data -> Student Download File', (done) => {
        // Upload
        chai.request(BASE_API_URL)
            .post(uploadFileEndpoint(1))
            .field('task', 'PS1')
            .attach('file', getTestDataFilePath('andrew_marks.zip'))
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The file has been uploaded.');

                // Getting all file info i.e. file_names and file ids
                chai.request(BASE_API_URL)
                    .get(getAllFilesEndpoint(1))
                    .query({ task: 'PS1' })
                    .set('Authorization', studentAndrewToken)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('count', 1);
                        expect(res.body).to.have.property('files');
                        expect(res.body.files).to.be.an('array');
                        expect(res.body).to.have.property('message', "Files are returned")

                        res.body.files.forEach(fileItem => {
                            expect(fileItem).to.have.property('file_id');
                            expect(fileItem).to.have.property('file_name');
                            expect(fileItem.file_name).to.be.oneOf(['/andrew_marks.txt'])

                            // Removing beginning forward-slash i.e. '/andrew_marks.txt' -> 'andrew_marks.txt'
                            const file_name = fileItem.file_name.slice(1);

                            // Retrieving files
                            chai.request(BASE_API_URL)
                                .get(retrieveFileEndpoint(1))
                                .query({ task: 'PS1', file_id: fileItem.file_id })
                                .set('Authorization', studentAndrewToken)
                                .end((err, res) => {
                                    expect(res).to.have.status(200);
                                    expect(res.header).to.have.property('content-disposition', `attachment; filename=${file_name}.txt`)
                                })

                        })

                        done();
                    })

            });
    });
});
