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
        task_group_id: 1,
        max_token: 10,
        name: "assignments"
    },
    {
        task_group_id: 2,
        max_token: 0,
        name: "exams"
    },
    {
        task_group_id: 3,
        max_token: 2,
        name: "tutorials"
    },
    {
        task_group_id: 4,
        max_token: 2,
        name: "lectures"
    },
    {
        task_group_id: 5,
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
                    expect(res.body.task_group).to.include(taskGroup);
                })
                done();
            });
    });

    it('ta should be be able to get all task groups', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.teachingAssistant, 1))
            .set('Authorization', cscTaToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.equal(expectedTasksGroups.length);
                expect(res.body).to.have.property('task_group');
                expect(res.body.task_group).to.have.lengthOf(expectedTasksGroups.length);
                expectedTasksGroups.forEach((taskGroup) => {
                    expect(res.body.task_group).to.include(taskGroup);
                })
                done();
            });
    });

    it('non-staff user in course cannot access task groups', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.instructor, 1))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });

        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.teachingAssistant, 1))
            .set('Authorization', cscStudentToken)
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });
    });

    it('any instructor user not in course cannot access task groups', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.instructor, 1))
            .set('Authorization', matInstructorToken)
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });
    });

    it('any ta user not in course cannot access task groups', (done) => {
        chai.request(BASE_API_URL)
            .get(getTaskGroupAllEndpoint(ROLES.instructor, 1))
            .set('Authorization', matTaToken)
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });
    });


    after(async () => {
    });
});
