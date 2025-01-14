const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all interviews as an instructor
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/interview/all`}
 */
const interviewStaffAllEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/interview/all`;
};

const payload = [
    {
        task: 1,
        booked: 'true',
        interview_id: 1,
        time: '2024-04-15 13:30:00',
        date: '2024-04-15',
        host: 'cscinstructoruser',
        group_id: 1,
        length: 60,
        location: 'Online',
        note: 'zoom.com/meeting/124',
        cancelled: false
    }
]

describe('Get a specific students mark as Instructor Endpoint', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
    });

    it('Get specific interview as instructor', (done) => {
        chai.request(BASE_API_URL)
            .get(interviewStaffAllEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 1);
                expect(res.body).to.have.property('interviews').to.be.an('array');
                const interviews = res.body.interviews;
    
                // Assert interview properties
                expect(interviews[0]).to.have.property('task_id', 1);
                expect(interviews[0]).to.have.property('host', 'cscinstructoruser');
                expect(interviews[0]).to.have.property('group_id', 1);
                expect(interviews[0]).to.have.property('length', 60);
                expect(interviews[0]).to.have.property('location', 'Online');
                expect(interviews[0]).to.have.property('note', 'zoom.com/meeting/124');
                expect(interviews[0]).to.have.property('cancelled', false);
                done();
            });
    });

    it('Get specific interview as student (unauthorized)', (done) => {
        chai.request(BASE_API_URL)
            .get(interviewStaffAllEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .query(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "Invalid or unauthorized access to course.")
                done();
            });
    });

    it('Get interviews with incorrect payload', (done) => {
        chai.request(BASE_API_URL)
            .get(interviewStaffAllEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query({ incorrect_key: 'incorrect_value' }) // Provide an incorrect key-value pair in the payload
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The task is missing or invalid.");
                done();
            });
    });

    it('Get interviews with incorrect course id', (done) => {
        chai.request(BASE_API_URL)
            .get(interviewStaffAllEndpoint(100))
            .set('Authorization', cscInstructorToken)
            .query(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "Invalid or unauthorized access to course.");
                done();
            });
    });

    after(async () => {
    });
});
