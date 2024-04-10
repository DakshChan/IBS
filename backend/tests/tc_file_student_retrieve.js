const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {getAuthBearerToken, checkPropertiesExist} = require("./utils/helpers");
const {BASE_API_URL} = require("./utils/constants"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get a specific file
 * @param course_id the id of the course
 * @returns {`/course/${string}/file/retrieve`}
 */
const retrieveFileEndpoint = (course_id) => {
    return `/course/${course_id}/file/retrieve`;
};

describe('[file/student module]: GET all files endpoint', () => {
    let instructorToken, studentDomiToken, studentAndrewToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructor', 'password');
        studentDomiToken = await getAuthBearerToken('domi', 'password');
        studentAndrewToken = await getAuthBearerToken('andrew', 'password');
    });

    it('Student should be able to a specific file for a task', (done) => {
        chai.request(BASE_API_URL)
            .get(retrieveFileEndpoint(1))
            .query({ task: 'PS1', file_id: 0 })
            .set('Authorization', studentDomiToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.header).to.have.property('content-disposition', 'attachment; filename=domi_marks.txt')
                done();
            })
    });

    it('Student cannot retrieve a file that does not belong to them', (done) => {
        chai.request(BASE_API_URL)
            .get(retrieveFileEndpoint(1))
            .query({ task: 'PS1', file_id: 0 })
            .set('Authorization', studentAndrewToken)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message', "The file id is invalid.")
                done();
            })
    });

    it('File ID must be specified', (done) => {
        chai.request(BASE_API_URL)
            .get(retrieveFileEndpoint(1))
            .query({ task: 'PS1' })
            .set('Authorization', studentAndrewToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The file id is not a valid integer.")
                done();
            })
    });

    it('Task must be specified', (done) => {
        chai.request(BASE_API_URL)
            .get(retrieveFileEndpoint(1))
            .query({ file_id: 0 })
            .set('Authorization', studentAndrewToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The task is missing or invalid.")
                done();
            })
    });

    it("Hidden files cannot be retrieved", (done) => {
        chai.request(BASE_API_URL)
            .get(retrieveFileEndpoint(1))
            .query({ task: 'PS2' })
            .set('Authorization', studentAndrewToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The files are not ready yet.")
                done();
            })
    });
    
});
