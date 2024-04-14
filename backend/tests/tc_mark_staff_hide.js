const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get marks as stduent provided the course_id
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/mark/hide`}
 */
const hideStaffMarkEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/mark/hide`;
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

    it('Multiple marks should be hidden.', (done) => {
        chai.request(BASE_API_URL)
            .put(hideStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 7);
                expect(res.body).to.have.property('message', '7 marks are hidden.');
                done();
            });
    });

    it('One mark should be hidden.', (done) => {
        chai.request(BASE_API_URL)
            .put(hideStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(markListPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 1);
                expect(res.body).to.have.property('message', '1 mark is hidden.');
                done();
            });
    });


    it('Should return an error if the task is missing or invalid', (done) => {
        chai.request(BASE_API_URL)
            .put(hideStaffMarkEndpoint(1))
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
            .put(hideStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(markListPayload[2])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 0);
                expect(res.body).to.have.property('message', '1 mark is hidden.');
                done();
            });
    });
});