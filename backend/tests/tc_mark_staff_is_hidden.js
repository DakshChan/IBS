const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to check if marks are hidden
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/mark/hide/`}
 */
const staffMarkIsHiddenEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/mark/is_hidden`;
};

const markListPayload = [
    {
        task: 'Assignment-1'
    },
    {
        task: 'Assignment-2'
    },
    {
        task: 'Assignment-3'
    }
]

describe('Check if Mark is hidden or not as Instructor Endpoint', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentuserA', 'password');
    });

    it('Marks are not hidden.', (done) => {
        chai.request(BASE_API_URL)
            .get(staffMarkIsHiddenEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('hidden').that.is.false;
                done();
            });
    });

    it('Marks are hidden', (done) => {
        chai.request(BASE_API_URL)
            .get(staffMarkIsHiddenEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(markListPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('hidden').that.is.true;
                done();
            });
    });


    it('Should return an error if the task is missing or invalid', (done) => {
        chai.request(BASE_API_URL)
            .get(staffMarkIsHiddenEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query({}) // Missing task
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('Should return an empty json if the task does not exist', (done) => {
        chai.request(BASE_API_URL)
            .get(staffMarkIsHiddenEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(markListPayload[2])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('A student should have not be able to access this endpoint', (done) => {
        chai.request(BASE_API_URL)
            .get(staffMarkIsHiddenEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .query(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });
});