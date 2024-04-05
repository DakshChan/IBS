// test/student/leaveGroup.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app");
const sequelize = require('../helpers/database');
const { getAuthBearerToken } = require("./utils/helpers");
const { BASE_API_URL } = require("./utils/constants");
const { ROLES } = require("../helpers/constants")

chai.use(chaiHttp);
const expect = chai.expect;

const leaveGroupEndpoint = (course_id) => {
    return `/course/${course_id}/group/leave`;
};

describe('[student/group/leave module]: DELETE leave group endpoint', () => {
    let cscStudentToken, studentNoGroupToken;

    before(async () => {
        cscStudentToken = await getAuthBearerToken('cscstudentuser', 'password');
        studentNoGroupToken = await getAuthBearerToken('studentnogroup', 'password');
    });

    it('should leave a group successfully', (done) => {
        chai.request(BASE_API_URL)
            .delete(leaveGroupEndpoint(1))
            .set('Authorization', cscStudentToken)
            .send({ task: "Task1" }) // Assuming task ID is 1
            .end(async (err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'You have left the group.');

                // Verify the user is removed from the database
                // const groupUser = await GroupUser.findOne({
                //     where: { username: 'cscstudentuser', '$Group.Task.task$': 1 },
                //     include: ['Group']
                // });
                // expect(groupUser).to.be.null;

                done();
            });
    });

    it('should return an error if not in a group', (done) => {
        chai.request(BASE_API_URL)
            .delete(leaveGroupEndpoint(1))
            .set('Authorization', studentNoGroupToken)
            .send({ task: "Task1" }) // Assuming task ID is 1
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'You were not in the group.');
                done();
            });
    });

    after(async () => {
        // Clean up the database after tests
        // await sequelize.sync({ force: true });
    });
});
