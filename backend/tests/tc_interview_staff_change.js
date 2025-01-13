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
 * @returns {`/instructor/course/${string}/interview/change`}
 */
const interviewStaffChangeEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/interview/change`;
};

const updatedPayload = [
    {
        task: 1,
        set_time: '2024-04-15 14:30:00',
        set_group_id: 1,
        set_length: 90,
        set_location: 'In-person',
        set_note: 'New meeting location: room 101',
        set_cancelled: true,
        force: false
    },
    {
        task: 1
    },
    {
        task: 4,
        set_time: '2024-04-15 13:30:00',
        set_group_id: 1,
        set_length: 60,
    }
];

describe('Change interview details endpoint as an instructor', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
    });

    it('Change interview details as instructor', (done) => {
        chai.request(BASE_API_URL)
            .put(interviewStaffChangeEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(updatedPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', '1 interview has been changed.');
                done();
            });
    });

    it('Change interview details as instructor but only has the task name ie no changes', (done) => {
        chai.request(BASE_API_URL)
            .put(interviewStaffChangeEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(updatedPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'There is nothing to change.');
                done();
            });
    });

    it('Change interview details as instructor but task does not exist', (done) => {
        chai.request(BASE_API_URL)
            .put(interviewStaffChangeEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(updatedPayload[2])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('Change interview details endpoint as student (unauthorized)', (done) => {
        chai.request(BASE_API_URL)
            .put(interviewStaffChangeEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .query(updatedPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "Invalid or unauthorized access to course.")
                done();
            });
    });

    it('Change interviews with incorrect updatedPayload', (done) => {
        chai.request(BASE_API_URL)
            .put(interviewStaffChangeEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query({ incorrect_key: 'incorrect_value' }) // Provide an incorrect key-value pair in the updatedPayload
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "The task is missing or invalid.");
                done();
            });
    });

    it('Change interviews with incorrect course id', (done) => {
        chai.request(BASE_API_URL)
            .put(interviewStaffChangeEndpoint(100))
            .set('Authorization', cscInstructorToken)
            .query(updatedPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', "Invalid or unauthorized access to course.");
                done();
            });
    });

    after(async () => {
    });
});
