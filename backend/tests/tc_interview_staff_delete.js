const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to change interviews as an instructor
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/interview/delete`}
 */
const interviewStaffDeleteEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/interview/delete`;
};

const payload = [
    {
        interview_id: 1,
        task: 'Assignment-1',
        username: 'cscinstructoruser'

    },
    {
        interview_id: 2,
        task: 'Assignment-1',
        username: 'cscinstructoruser'
    },
    {
        interview_id: 100,
        task: 'Assignment-1',
        username: 'cscinstructoruser'
    },
    {
        interview_id: 2,
        task: 'Assignment-1',
        username: 'cscinstructoruser'
    }
];

describe('Delete interview endpoint as an instructor', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
    });


    it('Change interview details endpoint as student (unauthorized)', (done) => {
        chai.request(BASE_API_URL)
            .delete(interviewStaffDeleteEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .query(payload[2])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "Invalid or unauthorized access to course.")
                done();
            });
    });

    it('Delete interview details as instructor with all correct payload and group_id is null', (done) => {
        chai.request(BASE_API_URL)
            .delete(interviewStaffDeleteEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The interview is deleted');
                done();
            });
    });

    it('Delete interview details as instructor with all correct payload, but group_id is not null', (done) => {
        chai.request(BASE_API_URL)
            .delete(interviewStaffDeleteEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[1])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The interview cannot be found.');
                done();
            });
    });

    it('Delete interview as an instructor but with invalid interview id', (done) => {
        chai.request(BASE_API_URL)
            .delete(interviewStaffDeleteEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[2])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The interview cannot be found.");
                done();
            });
    });

    it('Delete interview as an instructor but with invalid course id', (done) => {
        chai.request(BASE_API_URL)
            .delete(interviewStaffDeleteEndpoint(100))
            .set('Authorization', cscInstructorToken)
            .query(payload[2])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "Invalid or unauthorized access to course.");
                done();
            });
    });

    after(async () => {
    });
});
