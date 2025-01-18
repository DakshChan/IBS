const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const { BASE_API_URL } = require("./utils/constants");
const { getAuthBearerToken } = require("./utils/helpers"); // Adjust the path as per your project structure

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to upload marks.
 * @param course_id id of the course
 * @returns {`/instructor/course/${string}/mark/upload/`}
 */
const uploadMarkEndpoint = (course_id) => {
    return `/admin/role/upload`;
};

function getTestDataFilePath(filename) {
    return `${__dirname}/test-data/${filename}`;
}

const payload = {
    course_id: 1,
    update_user_info: false,
    role: "student"
};

describe('Admin Upload Role', () => {
    let cscInstructorToken, cscStudentAToken;

    beforeEach(async () => {
        cscadminToken = await getAuthBearerToken('adminuser', 'password');
        cscStudentAToken = await getAuthBearerToken('studenta', 'password');
    });

    it('Upload a CSV with student accounts and roles for course', (done) => {
        chai.request(BASE_API_URL)
            .post("/admin/role/upload")
            .set('Authorization', cscadminToken) // Set authorization token
            .attach('file', getTestDataFilePath('roles.csv')) // Attach the CSV file
            .field('course_id', payload.course_id) // Add course_id field
            .field('update_user_info', payload.update_user_info) // Add update_user_info field
            .field('role', payload.role) // Add update_user_info field
            .end((err, res) => {
                console.log(res.body);
                if (err) return done(err); // Handle errors
                expect(res).to.have.status(200); // Assert status is 200
                expect(res.body).to.have.property('message'); // Check response body
                done();
            });
    });
    

});