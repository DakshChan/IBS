const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");
const {DataTypes} = require("sequelize"); // Adjust the path as per your project structure
const expect = chai.expect;

chai.use(chaiHttp);

describe('Add Task as Admin', () => {
    let instructorToken;

    before(async () => {
        // Login as admin to obtain token
        instructorToken = await getAuthBearerToken('instructoruser', 'instructorPassword');
    });

    it('should add a task to a task group', (done) => {
        chai.request(BASE_API_URL)
            .post('/instructor/course/1/task/add')
            .set('Authorization', instructorToken)
            .send({
                course_id: 1,
                task: "1",
                long_name: "assignment1",
                due_date: "2024-02-16 15:30:00",
                weight: 10,
                hidden: false,
                min_member: 1,
                max_member: 4,
                max_token: 3,
                hide_interview: false,
                hide_file: false,
                change_group: false,
                interview_group: "myInterviewGroup_123",
                task_group_id: 1,
                starter_code_url: "https://testuser.git"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it('fail to add task due to an invalid starter code url', (done) => {
        chai.request(BASE_API_URL)
            .post('/instructor/course/1/task/add')
            .set('Authorization', instructorToken)
            .send({
                course_id: 1,
                task: "1",
                long_name: "assignment1",
                due_date: "2024-02-16 15:30:00",
                weight: 10,
                hidden: false,
                min_member: 1,
                max_member: 4,
                max_token: 3,
                hide_interview: false,
                hide_file: false,
                change_group: false,
                interview_group: "myInterviewGroup_123",
                task_group_id: 1,
                starter_code_url: "https://testuser.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The starter code url is invalid. It should start with https:// and end with .git');
                done();
            });
    });
    it('should fail to add a task due to missing task', (done) => {
        chai.request(BASE_API_URL)
            .post('/instructor/course/1/task/add')
            .set('Authorization', instructorToken)
            .send({
                course_id: 1,
                long_name: "assignment1",
                due_date: "2024-02-16 15:30:00",
                weight: 10,
                hidden: false,
                min_member: 1,
                max_member: 4,
                max_token: 3,
                hide_interview: false,
                hide_file: false,
                change_group: false,
                interview_group: "myInterviewGroup_123",
                task_group_id: 1,
                starter_code_url: "https://testuser.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });
});
