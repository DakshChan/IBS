const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL, ROLES } = require("./utils/constants"); // Adjust the path as per your project structure
chai.use(chaiHttp);
const expect = chai.expect;

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
    let instructorToken, taToken, studentToken;
    before(async () => {
        instructorToken = await getAuthBearerToken('adminuser', 'adminpassword');
        studentToken = await getAuthBearerToken('demouser1', 'password');
        taToken = await getAuthBearerToken('demouser1', 'password');
    });

    it('instructor should be be able to get all task groups', (done) => {

    });

    it('ta should be be able to get all task groups', (done) => {

    });

    it('non-staff user in course cannot access task groups', (done) => {

    });

    it('any instructor user not in course cannot access task groups', (done) => {

    });

    it('any ta user not in course cannot access task groups', (done) => {

    });


    after(async () => {
    });
});
