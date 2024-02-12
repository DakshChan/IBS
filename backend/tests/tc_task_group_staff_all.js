const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants"); // Adjust the path as per your project structure
const { ROLES } = require("../helpers/constants")

chai.use(chaiHttp);
const expect = chai.expect;

const expectedTasksGroups = [
    {
        id: 1,
        task_group_id: 1,
        course_id: 1,
        max_token: 10,
        name: "assignments"
    },
    {
        id: 2,
        task_group_id: 2,
        course_id: 1,
        max_token: 0,
        name: "exams"
    },
    {
        id: 3,
        task_group_id: 3,
        course_id: 1,
        max_token: 2,
        name: "tutorials"
    },
    {
        id: 4,
        task_group_id: 4,
        course_id: 1,
        max_token: 2,
        name: "lectures"
    },
    {
        id: 5,
        task_group_id: 5,
        course_id: 1,
        max_token: 5,
        name: "quizzes"
    }
]

/**
 * Constructs the endpoint to get all task groups given role and course id
 * @param role one of the values in ./constants.js ROLES
 * @param course_id the id of the course
 * @returns {`/${string}/course/${string}/task_group/all`}
 */
const getTaskGroupAllEndpoint = (role, course_id) => {
    return `/${role}/course/${course_id}/task_group/all`;
};

describe('[task_group/staff module]: GET all task groups endpoint', () => {
    let cscInstructorToken, cscTaToken, cscStudentToken;
    let matInstructorToken, matTaToken, matStudentToken;
    before(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        cscTaToken = await getAuthBearerToken('csctauser', 'password');
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');

        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        matTaToken = await getAuthBearerToken('mattauser', 'password');
        matStudentToken = await getAuthBearerToken('matstudentuser', 'password');

    });

    it('instructor should be be able to get all task groups', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.equal(expectedTasksGroups.length);
                expect(res.body).to.have.property('task_group');
                expect(res.body.task_group).to.have.lengthOf(expectedTasksGroups.length);
                expectedTasksGroups.forEach((taskGroup) => {
                    const task_group_list = res.body.task_group.filter(tg => tg.task_group_id === taskGroup.task_group_id)
                    expect(task_group_list).to.have.lengthOf(1);
                    expect(task_group_list[0].name).to.equal(taskGroup.name);
                    expect(task_group_list[0].course_id).to.equal(taskGroup.course_id);
                    expect(task_group_list[0].max_token).to.equal(taskGroup.max_token);
                })
                done();
            });
    });

    it('non-staff user in course cannot access task groups', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('any instructor user not in course cannot access task groups', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.instructor, 1))
            .set('Authorization', matInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('any ta user not in course cannot access task groups', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.instructor, 1))
            .set('Authorization', matTaToken)
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });


    after(async () => {
    });
});
