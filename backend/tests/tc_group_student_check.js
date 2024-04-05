const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure
const { ROLES } = require("../helpers/constants")

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to modify a task group as the given role for the
 * course with given course id
 * @param role one of the values in ./constants.js ROLES
 * @param course_id the id of the course
 * @returns {`/${string}/course/${string}/task_group/change`}
 */
const checkGroupEndpoint = (course_id, task) => {
    return `/course/${course_id}/group/check?task=${task}`;
};

describe('', () => {
    let cscStudentToken, cscStudent2Token, studentNoGroupToken;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        cscStudent2Token = await getAuthBearerToken('cscstudentuser2', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should give group info of a student whom already in a group', (done) => {
        chai.request(BASE_API_URL)
            .get(checkGroupEndpoint(1, 1))
            .set('Authorization', cscStudentToken)
            .send({  task: "Task1" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You have joined a group.');
                expect(res.body).to.have.property('group_id', 1);
                expect(res.body.members[0]).to.have.property('status', 'confirmed');
                expect(res.body.members[1]).to.have.property('status', 'pending');
                expect(res.body).to.have.property('gitlab_url', 'https://testuser.git');
                done();
            });
    });
    it('should return no additional info for student neither invited nor in a group', (done) => {
        chai.request(BASE_API_URL)
            .get(checkGroupEndpoint(1, 1))
            .set('Authorization', studentNoGroupToken)
            .send({  task: "Task1" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You are not in a group.');
                done();
            });
    });


    after(async () => {
    });
});
