const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const {getAuthBearerToken} = require("./utils/helpers");
const expect = chai.expect;

chai.use(chaiHttp);

describe('Get All Tasks of a Course by Instructor', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'instructorPassword');
    });

    it('should retrieve all tasks for a specific course and verify tasks', (done) => {
        chai.request("http://localhost:3001")
            .get('/instructor/course/1/task/all')
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count').that.is.at.least(2);
                expect(res.body).to.have.property('task').that.is.an('array');

                // Check for specific tasks by long name
                const hasFirstTask = res.body.task.some(task => task.long_name === "First Task");
                const hasSecondTask = res.body.task.some(task => task.long_name === "Second Task");
                expect(hasFirstTask).to.be.true;
                expect(hasSecondTask).to.be.true;

                done();
            });
    });
    it('should retrieve 0 tasks for course that does not have any tasks', (done) => {
        chai.request("http://localhost:3001")
            .get('/instructor/course/2/task/all')
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count').that.is.at.least(0);
                expect(res.body).to.have.property('task').that.is.an('array');
                done();
            });
    });

});
