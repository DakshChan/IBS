const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {getAuthBearerToken, checkPropertiesExist} = require("./utils/helpers");
const {BASE_API_URL} = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all files
 * @param course_id the id of the course
 * @returns {`/course/${string}/file/all`}
 */
const getAllFilesEndpoint = (course_id) => {
    return `/course/${course_id}/file/all`;
};

describe('[file/student module]: GET all files endpoint', () => {
    let instructorToken, studentDomiToken, studentAndrewToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructor', 'password');
        studentDomiToken = await getAuthBearerToken('domi', 'password');
        studentAndrewToken = await getAuthBearerToken('andrew', 'password');
    });

    it('Student should be able to get all their files for a specific task', (done) => {
        chai.request(BASE_API_URL)
            .get(getAllFilesEndpoint(1))
            .query({ task: 'PS1' })
            .set('Authorization', studentDomiToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 2);
                expect(res.body).to.have.property('files');
                expect(res.body.files).to.be.an('array');
                expect(res.body).to.have.property('message', "Files are returned")

                res.body.files.forEach(fileItem => {
                    expect(fileItem).to.have.property('file_id');
                    expect(fileItem).to.have.property('file_name');
                    expect(fileItem.file_name).to.be.oneOf(['/domi_marks.txt', '/group_1_feedback.txt'])
                })

                done();
            })
    });

    it('Notify if no associated files exist', (done) => {
        chai.request(BASE_API_URL)
            .get(getAllFilesEndpoint(1))
            .query({ task: 'PS1' })
            .set('Authorization', studentAndrewToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 0);
                expect(res.body).to.have.property('files');
                expect(res.body.files).to.be.an('array')
                expect(res.body.files.length).to.equal(0);
                expect(res.body).to.have.property('message', "You don't have any files for this task.")
                done();
            })
    });

    it("Hidden files cannot be retrieved", (done) => {
        chai.request(BASE_API_URL)
            .get(getAllFilesEndpoint(1))
            .query({ task: 'PS2' })
            .set('Authorization', studentAndrewToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The files are not ready yet.")
                done();
            })
    });

    it('Task must be specified', (done) => {
        chai.request(BASE_API_URL)
            .get(getAllFilesEndpoint(1))
            .query({ })
            .set('Authorization', studentAndrewToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The task is missing or invalid.")
                done();
            })
    });

    after(async () => {
    });
});
