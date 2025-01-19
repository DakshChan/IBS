const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");
const expect = chai.expect;

chai.use(chaiHttp);

describe('Change Token as Staff', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
    });

    it('should successfully change task details', (done) => {
        chai.request(BASE_API_URL)
            .put('/instructor/course/1/token/change')
            .set('Authorization', instructorToken)
            .send({
                course_id: 1,
                username: "cscstudentusera",
                token_count: 5,

            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The token is changed.');
                done();
            });
    });

    it('should not change if token count missing', (done) => {
        chai.request(BASE_API_URL)
            .put('/instructor/course/1/token/change')
            .set('Authorization', instructorToken)
            .send({
                course_id: 1,
                username: "cscstudentusera"
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The token count is missing or has invalid format.');
                done();
            });
    });

});

