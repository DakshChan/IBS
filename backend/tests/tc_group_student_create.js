const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");



chai.use(chaiHttp);
const expect = chai.expect;

const createGroupEndpoint = (course_id) => {
    return `/course/${course_id}/group/create`;
};

describe('POST /group_student_create', () => {
    let cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should create a group and associate the user', (done) => {
        chai.request(BASE_API_URL)
            .post(createGroupEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({  task: "Task1" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Group and Gitlab repo have been created. User has been added to the Gitlab project.');
                expect(res.body).to.have.property('group_id');
                expect(res.body).to.have.property('url');
                done();
            });
    });

    it('should not allow creating a group if the task is missing or invalid', (done) => {
        chai.request(BASE_API_URL)
            .post(createGroupEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({ change_group: true })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });
});
