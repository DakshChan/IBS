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
 * @returns {`/course/${string}/interview/cancel`}
 */
const interviewStudentCancelEndpoint = (course_id) => {
    return `/course/${course_id}/interview/cancel`;
};

const payload = [
    {
        task: 1,
    }
]

describe('Interview Student Cancel Interview', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken, cscStudentBToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
        cscStudentBToken = await getAuthBearerToken('cscstudentuserb', 'password');
    });

    it('Should let student cancel interview', (done) => {
        chai.request(BASE_API_URL)
            .delete(interviewStudentCancelEndpoint(1))
            .set('Authorization', cscStudentBToken)
            .send(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    after(async () => {
    });
});
