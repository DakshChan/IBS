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
 * @returns {`/instructor/course/${string}/mark/all`}
 */
const getStaffMarkEndpoint = (course_id) => {
    return `/instructor/course/${course_id}/mark/all`;
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
            .get(getStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(markListPayload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('marks');
                const marks = res.body.marks;
    
                // Check if the student user 'cscstudentusera' has the expected marks for the specified task
                expect(marks).to.have.property('cscstudentusera');
                expect(marks['cscstudentusera']).to.have.property('Correctness');
                expect(marks['cscstudentusera']['Correctness']).to.have.property('mark').that.equals(80);
    
                expect(marks['cscstudentusera']).to.have.property('Code Style');
                expect(marks['cscstudentusera']['Code Style']).to.have.property('mark').that.equals(20);
                
                expect(marks['cscstudentusera']).to.have.property('Bonus');
                expect(marks['cscstudentusera']['Bonus']).to.have.property('mark').that.equals(10);
    
                expect(marks['cscstudentusera']).to.have.property('Participation Bonus');
                expect(marks['cscstudentusera']['Participation Bonus']).to.have.property('mark').that.equals(4);
    
                // Check if the total mark calculation is correct for 'cscstudentusera'
                expect(marks['cscstudentusera']['Total']).to.have.property('mark').that.equals(114);
                expect(marks['cscstudentusera']['Total']).to.have.property('out_of').that.equals(115);
    
                // Check that Assignment-2 is not included
                expect(marks['cscstudentusera']).to.not.have.property('Assignment-2');

                // Check if the student user 'cscstudentuserb' has the expected marks for the specified task
                expect(marks).to.have.property('cscstudentuserb');
                expect(marks['cscstudentuserb']).to.have.property('Correctness');
                expect(marks['cscstudentuserb']['Correctness']).to.have.property('mark').that.equals(80);
    
                expect(marks['cscstudentuserb']).to.have.property('Code Style');
                expect(marks['cscstudentuserb']['Code Style']).to.have.property('mark').that.equals(20);
                
                expect(marks['cscstudentuserb']).to.have.property('Bonus');
                expect(marks['cscstudentuserb']['Bonus']).to.have.property('mark').that.equals(0);
    
                expect(marks['cscstudentuserb']).to.have.property('Participation Bonus');
                expect(marks['cscstudentuserb']['Participation Bonus']).to.have.property('mark').that.equals(0);
    
                // Check if the total mark calculation is correct for 'cscstudentuserb'
                expect(marks['cscstudentuserb']['Total']).to.have.property('mark').that.equals(100);
                expect(marks['cscstudentuserb']['Total']).to.have.property('out_of').that.equals(115);
    
                // Check that Assignment-2 is not included
                expect(marks['cscstudentuserb']).to.not.have.property('Assignment-2');
                done();
            });
    });

    it('When task field is not passed in payload, staff should be able to get all marks. All student marks should be returned, including hidden marks.', (done) => {
        chai.request(BASE_API_URL)
            .get(getStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(markListPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('marks');
                const marks = res.body.marks;

                expect(res.body.marks).to.have.property('cscstudentusera');
                expect(marks['cscstudentusera']).to.have.property('Assignment-1');
                expect(marks['cscstudentusera']['Assignment-1']).to.have.property('mark').that.equals(114);
                expect(marks['cscstudentusera']['Assignment-1']).to.have.property('out_of').that.equals(115);
                expect(marks['cscstudentusera']['Assignment-1']).to.have.property('weight').that.equals(15);

                expect(marks['cscstudentusera']).to.have.property('Assignment-2');
                expect(marks['cscstudentusera']['Assignment-2']).to.have.property('mark').that.equals(1);
                expect(marks['cscstudentusera']['Assignment-2']).to.have.property('out_of').that.equals(1);
                expect(marks['cscstudentusera']['Assignment-2']).to.have.property('weight').that.equals(15);

                expect(res.body.marks).to.have.property('cscstudentuserb');
                expect(marks['cscstudentuserb']).to.have.property('Assignment-1');
                expect(marks['cscstudentuserb']['Assignment-1']).to.have.property('mark').that.equals(100);
                expect(marks['cscstudentuserb']['Assignment-1']).to.have.property('out_of').that.equals(115);
                expect(marks['cscstudentuserb']['Assignment-1']).to.have.property('weight').that.equals(15);

                expect(marks['cscstudentuserb']).to.have.property('Assignment-2');
                expect(marks['cscstudentuserb']['Assignment-2']).to.have.property('mark').that.equals(1);
                expect(marks['cscstudentuserb']['Assignment-2']).to.have.property('out_of').that.equals(1);
                expect(marks['cscstudentuserb']['Assignment-2']).to.have.property('weight').that.equals(15);

                done();
            });
    });


    it('An instructor tries to get marks for a course that has no criteria and no marks. The result should be empty.', (done) => {
        chai.request(BASE_API_URL)
            .get(getStaffMarkEndpoint(2))
            .set('Authorization', matInstructorToken)
            .query(markListPayload[1])
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body.marks).to.not.exist
                done();
            });
    });

    it('A student should have not be able to get marks from this endpoint.', (done) => {
        chai.request(BASE_API_URL)
            .get(getStaffMarkEndpoint(1))
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
            .get(getStaffMarkEndpoint(100))
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
            .get(getStaffMarkEndpoint(1))
            .set('Authorization', cscInstructorToken)
            .query(badPayload)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message', 'Task does not exist or mark(s) not found for this task.');
                done();
            });
    });

    after(async () => {
    });
});
