const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers");
const expect = chai.expect;

chai.use(chaiHttp);

describe('Change Task Details as Staff', () => {
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

    it('should successfully change task details', (done) => {
        chai.request(BASE_API_URL)
            .put('/instructor/course/1/task/change')
            .set('Authorization', `Bearer ${instructorToken}`)
            .send({
                course_id: 1,
                task: "Task1",
                long_name: "Updated Long Name",
                due_date: "2024-02-16 15:30:00",
                weight: 20,
                hidden: true,
                min_member: 2,
                max_member: 6,
                max_token: 4,
                change_group: false,
                hide_interview: true,
                hide_file: true,
                interview_group: null,
                task_group_id: 1,
                starter_code_url: "https://updated-starter-code.git"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The task is updated.');
                done();
            });
    });

    it('should fail to change task details due to invalid due date', (done) => {
        chai.request(BASE_API_URL)
            .put('/instructor/course/1/task/change')
            .set('Authorization', `Bearer ${instructorToken}`)
            .send({
                task: "Task1",
                task_group_id: "invalid_group_id"
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The due date is missing or not correct.');
                done();
            });
    });
    it('should fail to change task details due to course id does not exist', (done) => {
        chai.request(BASE_API_URL)
            .put('/instructor/course/1/task/change')
            .set('Authorization', `Bearer ${instructorToken}`)
            .send({
                course_id: 2,
                task: "Task1",
                long_name: "Updated Long Name",
                due_date: "2024-02-16 15:30:00",
                weight: 20,
                hidden: true,
                min_member: 2,
                max_member: 6,
                max_token: 4,
                change_group: false,
                hide_interview: true,
                hide_file: true,
                interview_group: null,
                task_group_id: 1,
                starter_code_url: "https://updated-starter-code.git"
            })
            .end((err, res) => {
                console.log(res.body)
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task does not exist.' );
                done();
            });
    });
    it('should fail to change task details due to task id does not exist', (done) => {
        chai.request(BASE_API_URL)
            .put('/instructor/course/1/task/change')
            .set('Authorization', `Bearer ${instructorToken}`)
            .send({
                course_id: 1,
                task: "InvalidTask",
                long_name: "Updated Long Name",
                due_date: "2024-02-16 15:30:00",
                weight: 20,
                hidden: true,
                min_member: 2,
                max_member: 6,
                max_token: 4,
                change_group: false,
                hide_interview: true,
                hide_file: true,
                interview_group: null,
                task_group_id: 1,
                starter_code_url: "https://updated-starter-code.git"
            })
            .end((err, res) => {
                console.log(res.body)
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task does not exist.' );
                done();
            });
    });

});

