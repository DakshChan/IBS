const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Adjust the path as per your project structure
const expect = chai.expect;

chai.use(chaiHttp);

describe('Get Specific Task of a Specific Course by Instructor', () => {
    let instructorToken;

    before(async () => {
        // Login as an instructor to obtain a token
        const loginResponse = await chai.request("http://localhost:3001")
            .post('/auth/login')
            .send({
                username: 'instructoruser',
                password: 'instructorPassword'
            });

        expect(loginResponse).to.have.status(200);
        instructorToken = loginResponse.body.token;
    });

    it('should retrieve specific task details for a specific course', (done) => {
        chai.request("http://localhost:3001")
            .get('/instructor/course/1/task/get') // Adjust endpoint as needed
            .query({ task: 'Task1' }) // Adjust task name as needed
            .set('Authorization', `Bearer ${instructorToken}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Task details are returned.');
                expect(res.body).to.have.property('task');
                expect(res.body.task).to.be.an('object');
                expect(res.body.task).to.have.property('task', 'Task1'); // Verify the specific task name


                done();
            });
    });

    it('should handle invalid task name', (done) => {
        chai.request("http://localhost:3001")
            .get('/instructor/course/1/task/get') // Adjust endpoint as needed
            .query({ task: 'InvalidTaskName' }) // Provide an invalid task name
            .set('Authorization', `Bearer ${instructorToken}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message', 'Task not found.');
                done();
            });
    });

});
