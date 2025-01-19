const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");
const expect = chai.expect;

chai.use(chaiHttp);

describe('Get Token as Staff', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
    });

    it('should successfully change task details', (done) => {
        chai.request(BASE_API_URL)
            .get('/instructor/course/1/token/get')
            .set('Authorization', instructorToken)
            .query({username: "cscstudentusera"})
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should not get if username query is missing', (done) => {
            chai.request(BASE_API_URL)
                .get('/instructor/course/1/token/get')
                .set('Authorization', instructorToken)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    done();
                });
    });

});
