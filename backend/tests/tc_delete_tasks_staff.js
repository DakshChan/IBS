const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");
const {DataTypes} = require("sequelize"); // Adjust the path as per your project structure
const expect = chai.expect;

chai.use(chaiHttp);

describe('Delete Task Endpoint', () => {
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


    it('should delete a task', (done) => {
        chai.request(BASE_API_URL)
            .delete('/instructor/course/1/task/delete') // Adjust endpoint as needed
            .set('Authorization', `Bearer ${instructorToken}`)
            .send({ task: 'Task1' }) // Task name from the seeded data
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'The task is deleted.');
                done();
            });
    });

    it('should return an error if task is missing or invalid', (done) => {
        chai.request(BASE_API_URL)
            .delete('/instructor/course/1/task/delete') // Adjust endpoint as needed
            .set('Authorization', `Bearer ${instructorToken}`)
            .send({task: 'InvalidTask'}) // No task provided
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'The task is missing or invalid.');
                done();
            });
    });

    // Add more test cases as needed
});
