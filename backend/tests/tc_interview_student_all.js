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
 * @returns {`/student/course/${string}/interview/all`}
 */
const interviewStudentAllEndpoint = (course_id) => {
    return `/student/course/${course_id}/interview/all`;
};

const payload = [
    {
        task: 1,
    }
]

describe('Interview Student All', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
    });

    it('Should get all interviews', (done) => {
        chai.request(BASE_API_URL)
            .get(interviewStudentAllEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .query(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    after(async () => {
    });
});
