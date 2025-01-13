const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure
const moment = require("moment");
const momentTimezone = require("moment-timezone");

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to schedule interviews as an instructor
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/interview/schedule`}
 */
const interviewStaffScheduleEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/interview/schedule`;
};

const payload = [
    {
        task: 1,
        time: '2024-04-15 14:30:00',
        length: 90,
        location: 'In-person',
    },
    {
        task: 4,
        time: '2024-04-16 14:30:00',
        length: 90,
        location: 'In-person',
    },
    {
        task: 1,
        time: moment.tz('2024-04-20 13:20:00', 'America/Toronto').format('YYYY-MM-DD HH:mm:ss'), // Starts 10 mins earlier
        length: 60, // Ends at 14:20:00, overlapping with 13:30:00 - 14:30:00
        location: 'Online'
    },
    {   
        // No task
        task: "",
        time: '2024-04-20 13:30:00',
        length: 10,
        location: 'Online'
    },
    {
        // No length
        task: 1,
        time: '2024-04-21 13:30:00',
        location: 'Online'
    },
    {   // No location
        task: 1,
        time: '2024-04-21 13:30:00',
        length: 60
    },
    {
        // No time
        task: 1,
        length: 60,
        location: 'Online'
    },
    {
        task: 1,
        time: '2024-03-15 14:30:00',
        length: 90,
        location: 'In-person',
    },
];

describe('Change interview details endpoint as an instructor', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
    });

    it('Schedule interview details as instructor', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStaffScheduleEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You have scheduled an interview for Assignment-1 at 2024-04-15 14:30:00 successfully.');
                done();
            });
    });

    it('Schedule interview details as instructor, but with a task name that doesnt exist', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStaffScheduleEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[1])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('Schedule interview details as instructor, but an interview is already scheduled in the same timeslot', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStaffScheduleEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[2])
            .end((err, res) => {
                expect(res).to.have.status(409);
                expect(res.body).to.have.property('message', 'You have another interview at the same time.');
                done();
            });
    });

    it('Schedule interview details as instructor, but empty task in payload', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStaffScheduleEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[3])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    it('Schedule interview details as instructor, but empty location in payload', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStaffScheduleEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[4])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The length is missing or has invalid format.');
                done();
            });
    });

    it('Schedule interview details as instructor, but empty location in payload', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStaffScheduleEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[5])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You have scheduled an interview for Assignment-1 at 2024-04-21 13:30:00 successfully.');
                done();
            });
    });

    it('Schedule interview details as instructor, but empty time in payload', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStaffScheduleEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(payload[6])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The time is missing or has invalid format. (YYYY-MM-DD HH:mm:ss)');
                done();
            });
    });

    it('Schedule interview details as studuent', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStaffScheduleEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .send(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Invalid or unauthorized access to course.');
                done();
            });
    });

    after(async () => {
    });
});
