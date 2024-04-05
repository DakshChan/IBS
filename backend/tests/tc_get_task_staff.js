const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const {getAuthBearerToken} = require("./utils/helpers");
const expect = chai.expect;

chai.use(chaiHttp);

describe('Get Specific Task of a Specific Course by Instructor', () => {
    let instructorToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('instructoruser', 'instructorPassword');
    });

    it('should retrieve specific task details for a specific course', (done) => {
        chai.request("http://localhost:3001")
            .get('/instructor/course/1/task/get')
            .query({ task: 'Task1' })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Task details are returned.');
                expect(res.body).to.have.property('task');
                expect(res.body.task).to.be.an('object');
                expect(res.body.task).to.have.property('task', 'Task1');
                expect(res.body.task).to.have.property('long_name', 'Task 1 Long Name');
                expect(res.body.task).to.have.property('due_date', '2024-02-16T20:30:00.000Z');
                expect(res.body.task).to.have.property('due_date_utc', '2024-02-16T20:30:00.000Z');
                expect(res.body.task).to.have.property('weight', 10);
                expect(res.body.task).to.have.property('hidden', false);
                expect(res.body.task).to.have.property('hide_file', false);
                expect(res.body.task).to.have.property('task_group_id', 1);
                done();
            });
    });

    it('should handle invalid task name', (done) => {
        chai.request("http://localhost:3001")
            .get('/instructor/course/1/task/get')
            .query({ task: 'InvalidTaskName' })
            .set('Authorization', instructorToken)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message', 'Task not found.');
                done();
            });
    });

});
