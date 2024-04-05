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

describe('Get Mark as Student Endpoint', () => {
    let cscStudentWithMarkToken, cscStudentWithoutMarkToken, cscInstructorToken;

    beforeEach(async () => {
        cscStudentWithMarkToken  = await getAuthBearerToken('cscstudentusera', 'password');
        cscStudentWithoutMarkToken = await getAuthBearerToken('cscstudentuserb', 'password');
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
    });

    it('A student has a submitted and non-hidden mark should be able to view their marks with the task name specified.', (done) => {
        chai.request(BASE_API_URL)
            .get(getStudentMarkEndpoint(1))
            .set('Authorization', cscStudentWithMarkToken)
            .send(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('marks');
                expect(res.body.marks).to.have.property('cscstudentusera');

                const studentMarks = res.body.marks.cscstudentusera;

                // Check each individual field
                expect(studentMarks).to.have.property('Correctness');
                expect(studentMarks).to.have.property('Code Style');
                expect(studentMarks).to.have.property('Bonus');
                expect(studentMarks).to.have.property('Total');

                // Check properties of each field
                expect(studentMarks['Correctness']).to.have.property('mark');
                expect(studentMarks['Correctness']).to.have.property('out_of');

                expect(studentMarks['Code Style']).to.have.property('mark');
                expect(studentMarks['Code Style']).to.have.property('out_of');

                expect(studentMarks['Bonus']).to.have.property('mark');
                expect(studentMarks['Bonus']).to.have.property('out_of');

                expect(studentMarks['Total']).to.have.property('mark');
                expect(studentMarks['Total']).to.have.property('out_of');

                done();
            });
    });

    it('A student has a submitted and non-hidden mark should be able to view all marks.', (done) => {
        chai.request(BASE_API_URL)
            .get(getStudentMarkEndpoint(1))
            .set('Authorization', cscStudentWithMarkToken)
            .send(markListPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('marks');
                const marks = res.body.marks;
                expect(marks).to.have.property('cscstudentusera');
                expect(marks['cscstudentusera']).to.have.property('Assignment-1');
                expect(marks['cscstudentusera']['Assignment-1']).to.have.property('mark').that.equals(110);
                expect(marks['cscstudentusera']['Assignment-1']).to.have.property('out_of').that.equals(110);
                expect(marks['cscstudentusera']['Assignment-1']).to.have.property('weight').that.equals(15);
                expect(marks['cscstudentusera']).to.not.have.property('Assignment-2');
                done();
            });
    });


    it('A student has a submitted mark but its hidden with a specified task. No marks should be shown, and it should throw an error', (done) => {
        chai.request(BASE_API_URL)
            .get(getStudentMarkEndpoint(1))
            .set('Authorization', cscStudentWithMarkToken)
            .send(markListPayload[2])
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message', 'Unknown error.');
                done();
            });
    });

    it('A student in the course but does not have submitted mark should have zero marks displayed.', (done) => {
        chai.request(BASE_API_URL)
            .get(getStudentMarkEndpoint(1))
            .set('Authorization', cscStudentWithoutMarkToken)
            .send(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('marks').that.is.an('object').that.is.empty;
                done();
            });
    });

    it('An instructor should have not be able to get a students mark from this endpoint.', (done) => {
        chai.request(BASE_API_URL)
            .get(getStudentMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .send(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('message', 'You don\'t have permission to access.');
                done();
            });
    });

    it('A student who has a mark, but enters the wrong course id, should not be able to get anything', (done) => {
        chai.request(BASE_API_URL)
            .get(getStudentMarkEndpoint(100))
            .set('Authorization', cscStudentWithMarkToken)
            .send(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('message', 'You don\'t have permission to access.');
                done();
            });
    });

    it('A student who has a mark, but enters the wrong task name, should not be able to get anything', (done) => {
        const badPayload = {
            task: 'Assignment-3',
            total: false
        }

        chai.request(BASE_API_URL)
            .get(getStudentMarkEndpoint(1))
            .set('Authorization', cscStudentWithMarkToken)
            .send(badPayload)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message', 'Unknown error.');
                done();
            });
    });

    after(async () => {
    });
});
