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
 * @returns {`/instructor/course/${string}/mark/all_csv`}
 */
const allCsvStaffMarkEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/mark/all_csv`;
};

const markListPayload = [
    {
        task: 'Assignment-1',
        total: false
    },
    {
        total: true
    },
    // Hidden
    {
        task: 'Assignment-2',
        total: false
    },
    {
        total: true
    }
]

describe('Get a specific students mark as Instructor Endpoint', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
    });

    it('When task field is passed in payload, staff should be able to get specific task marks. All student marks should be returned, including hidden marks.', (done) => {
        chai.request(BASE_API_URL)
            .get(allCsvStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.empty;
                done();
            });
    });

    it('When task field is not passed in payload, staff should be able to get all marks. All student marks should be returned, including hidden marks.', (done) => {
        chai.request(BASE_API_URL)
            .get(allCsvStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(markListPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.empty;
                
                done();
            });
    });


    it('An instructor tries to get marks for a course that has no criteria and no marks. The result should be empty.', (done) => {
        chai.request(BASE_API_URL)
            .get(allCsvStaffMarkEndpoint(2))
            .set('Authorization', matInstructorToken)
            .query(markListPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'No data is available.');
                done();
            });
    });

    it('A student should have not be able to get marks from this endpoint.', (done) => {
        chai.request(BASE_API_URL)
            .get(allCsvStaffMarkEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .query(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('An instructor who enters the wrong course id, should not be able to get anything', (done) => {
        chai.request(BASE_API_URL)
            .get(allCsvStaffMarkEndpoint(100))
            .set('Authorization', cscInstructorToken)
            .query(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    it('An instructor who enters the wrong task name, should not be able to get anything', (done) => {
        const badPayload = {
            task: 'Assignment-3',
            total: false
        }

        chai.request(BASE_API_URL)
            .get(allCsvStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(badPayload)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'No data is available.');
                done();
            });
    });

    after(async () => {
    });
});
