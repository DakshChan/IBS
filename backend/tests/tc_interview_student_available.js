const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all interviews as a student
 * @param course_id id of the course
 * @returns {`/course/${string}/interview/available`}
 */
const interviewStudentAvailableEndpoint = (course_id) => {
    return `/course/${course_id}/interview/available`;
};

const payload = [
    {
        task: 1,
    }
]

describe('Interview Student Available Interviews', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken, cscStudentBToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
        cscStudentBToken = await getAuthBearerToken('cscstudentuserb', 'password');
    });

    it('Get all available interviews for a task', (done) => {
        chai.request(BASE_API_URL)
            .get(interviewStudentAvailableEndpoint(1))
            .set('Authorization', cscStudentBToken)
            .query(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 1);
                done()
            });
    });

    // it('Get no interview available if all are booked', (done) => {
    //     chai.request(BASE_API_URL)
    //         .get(interviewStudentAvailableEndpoint(1))
    //         .set('Authorization', cscStudentAToken)
    //         .query(payload[0])
    //         .end((err, res) => {
    //             expect(res).to.have.status(200);
    //             expect(res.body).to.have.property('count', 0);
    //         });
    // });

    after(async () => {
    });
});
