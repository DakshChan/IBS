const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to release student marks as an instructor given course id parameter
 * and task name in the payload
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/mark/release`}
 */
const releaseStaffMarkEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/mark/release`;
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

describe('Get Mark as Instructor Endpoint', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentuserA', 'password');
    });

    it('Multiple marks should be released.', (done) => {
        chai.request(BASE_API_URL)
            .put(releaseStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 7);
                expect(res.body).to.have.property('message', '7 marks are released.');
                done();
            });
    });

    it('One mark should be released.', (done) => {
        chai.request(BASE_API_URL)
            .put(releaseStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(markListPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 1);
                expect(res.body).to.have.property('message', '1 mark is released.');
                done();
            });
    });


    it('Should return an error if the task is missing or invalid', (done) => {
        chai.request(BASE_API_URL)
            .put(releaseStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send({}) // Missing task
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('Should return an error if the task does not exist', (done) => {
        chai.request(BASE_API_URL)
            .put(releaseStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(markListPayload[2])
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message', 'Unknown error.');
                done();
            });
    });

    it('A student should have not be able to access this endpoint', (done) => {
        chai.request(BASE_API_URL)
            .put(releaseStaffMarkEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .query(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

});