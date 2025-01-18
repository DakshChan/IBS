const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const expect = chai.expect;
chai.use(chaiHttp);
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure


describe('Get Role Staff', () => {
    let instructorToken;

    before(async () => {

        instructorToken = await getAuthBearerToken('instructoruser', 'instructorPassword');

    });

    it('should retrieve roles for a specific user', (done) => {
        chai.request('http://localhost:3001')
            .get('/instructor/course/1/role/get')
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count', 2);
                done();
            });
    });

    // Additional test cases can be added here
});
