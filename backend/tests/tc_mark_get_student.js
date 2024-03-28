const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get marks as student provided the course_id & task_name
 * @param course_id id of the course
 * @returns {`/course/${string}/mark`}
 */
const getStudentMarkEndpoint = (course_id) => {
    return `/course/${course_id}/mark`;
};

const markListPayload = [
    {
        task: 'Assignment-1',
        total: false
    },
    {
        task: 'Assignment-1',
        total: true
    },
    // Hidden
    {
        task: 'Assignment-2',
        total: false
    },
    {
        task: 'Assignment-2',
        total: true
    }
]

describe('Get Mark as Student Endpoint', () => {
    let cscStudentWithMarkToken, cscStudentWithoutMarkToken, cscInstructorToken;

    beforeEach(async () => {
        cscStudentWithMarkToken  = await getAuthBearerToken('cscstudentusera', 'password');
        cscStudentWithoutMarkToken = await getAuthBearerToken('cscstudentuserb', 'password');
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
    });

    it('A student has a submitted and non-hidden mark should be able to view their individual marks.', (done) => {
        chai.request(BASE_API_URL)
            .get(getStudentMarkEndpoint(1))
            .set('Authorization', cscStudentWithMarkToken)
            .send(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count').that.equals(3);
                done();
            });
    });

    // it('A student has a submitted and non-hidden mark should be able to view their total mark.', (done) => {
    //     chai.request(BASE_API_URL)
    //         .get(getStudentMarkEndpoint(1))
    //         .set('Authorization', cscStudentWithMarkToken)
    //         .send(markListPayload[1])
    //         .end((err, res) => {
    //             expect(res).to.have.status(200);
    //             expect(res.body).to.have.property('count').that.equals(1);
    //             done();
    //         });
    // });
    //
    // it('A student has a submitted mark but its hidden. They should not be able to view any mark.', (done) => {
    //     chai.request(BASE_API_URL)
    //         .get(getStudentMarkEndpoint(1))
    //         .set('Authorization', cscStudentWithMarkToken)
    //         .send(markListPayload[2])
    //         .end((err, res) => {
    //             expect(res).to.have.status(404);
    //             expect(res.body).to.have.property('message', 'Unknown error.');
    //             done();
    //         });
    // });
    //
    // it('A student has a submitted mark but its hidden. They should not be able to view any mark.', (done) => {
    //     chai.request(BASE_API_URL)
    //         .get(getStudentMarkEndpoint(1))
    //         .set('Authorization', cscStudentWithMarkToken)
    //         .send(markListPayload[3])
    //         .end((err, res) => {
    //             expect(res).to.have.status(404);
    //             expect(res.body).to.have.property('message', 'Unknown error.');
    //             done();
    //         });
    // });
    //
    // it('A student in the course but does not have submitted mark should not be able to view it.', (done) => {
    //     chai.request(BASE_API_URL)
    //         .get(getStudentMarkEndpoint(1))
    //         .set('Authorization', cscStudentWithoutMarkToken)
    //         .send(markListPayload[0])
    //         .end((err, res) => {
    //             expect(res).to.have.status(404);
    //             expect(res.body).to.have.property('message', 'Unknown error.');
    //             done();
    //         });
    // });
    //
    // it('An instructor should have not be able to get a students mark from this endpoint.', (done) => {
    //     chai.request(BASE_API_URL)
    //         .get(getStudentMarkEndpoint(1))
    //         .set('Authorization', cscInstructorToken)
    //         .send(markListPayload[0])
    //         .end((err, res) => {
    //             expect(res).to.have.status(404);
    //             expect(res.body).to.have.property('message', 'Unknown error.');
    //             done();
    //         });
    // });
    //
    // it('A student who has a mark, but enters the wrong course id, should not be able to get anything', (done) => {
    //     chai.request(BASE_API_URL)
    //         .get(getStudentMarkEndpoint(100))
    //         .set('Authorization', cscStudentWithMarkToken)
    //         .send(markListPayload[0])
    //         .end((err, res) => {
    //             expect(res).to.have.status(404);
    //             expect(res.body).to.have.property('message', 'Unknown error.');
    //             done();
    //         });
    // });
    //
    // it('A student who has a mark, but enters the wrong task name, should not be able to get anything', (done) => {
    //     const badPayload = {
    //         task: 'Assignment-3',
    //         total: false
    //     }
    //
    //     chai.request(BASE_API_URL)
    //         .get(getStudentMarkEndpoint(1))
    //         .set('Authorization', cscStudentWithMarkToken)
    //         .send(badPayload)
    //         .end((err, res) => {
    //             expect(res).to.have.status(404);
    //             expect(res.body).to.have.property('message', 'Unknown error.');
    //             done();
    //         });
    // });

    after(async () => {
    });
});
