const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database'); // Adjust the path as per your project structure


chai.use(chaiHttp);
const expect = chai.expect;

describe('Get All Courses Endpoint', () => {
    let adminToken;

    before(async () => {
        // Login as admin to obtain token
        const loginResponse = await chai.request("http://localhost:3001")
            .post('/auth/login') // Replace with your actual login endpoint
            .send({
                username: 'adminuser', // Replace with actual admin username
                password: 'adminPassword' // Replace with actual admin password
            });

        expect(loginResponse).to.have.status(200);
        adminToken = loginResponse.body.token; // Extract token
    });

    it('should successfully retrieve all courses for an admin user', (done) => {
        chai.request("http://localhost:3001")
            .get('/admin/course/all')
            .set('Authorization', `Bearer ${adminToken}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('count').that.is.a('number');
                expect(res.body).to.have.property('course').that.is.an('array');

                // Validate the expected courses
                const expectedCourses = [
                    { course_code: 'CSC101', course_session: '2023S' },
                    { course_code: 'CSC102', course_session: '2023F' }
                ];

                expectedCourses.forEach(expectedCourse => {
                    const found = res.body.course.some(course =>
                        course.course_code === expectedCourse.course_code &&
                        course.course_session === expectedCourse.course_session
                    );
                    expect(found).to.be.true;
                });

                done();
            });
    });

    // Additional tests for error cases can be added here

    after(async () => {
        // Cleanup if necessary
    });
});
