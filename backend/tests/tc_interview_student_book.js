const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../app"); // Adjust the path as per your project structure
const sequelize = require('../helpers/database');
const {BASE_API_URL} = require("./utils/constants");
const {getAuthBearerToken} = require("./utils/helpers"); // Adjust the path as per your project structure
const moment = require('moment');
const { Interview } = require("../models")

chai.use(chaiHttp);
const expect = chai.expect;

/**
 * Constructs the endpoint to get all interviews as a student
 * @param course_id id of the course
 * @returns {`/course/${string}/interview/book`}
 */
const interviewStudentBookEndpoint = (course_id) => {
    return `/course/${course_id}/interview/book`;
};

const today = moment.utc().format('YYYY-MM-DD'); // Today's date in UTC
const timeNowPlus4Hours = moment.utc().add(4, 'hours').format('HH:mm:ss'); // Current time + 4 hours in UTC
const timeNowPlus6Hours = moment.utc().add(6, 'hours').format('HH:mm:ss'); // Current time + 6 hours in UTC

const payload = [
    {
        task: 1,
        time: `${today} ${timeNowPlus4Hours}`,
        location: 'Online',
    }
]

describe('Interview Student Book Interview', () => {
    let cscInstructorToken, matInstructorToken, cscStudentAToken, cscStudentBToken;

    beforeEach(async () => {
        cscInstructorToken = await getAuthBearerToken('cscinstructoruser', 'password');
        matInstructorToken = await getAuthBearerToken('matinstructoruser', 'password');
        cscStudentAToken = await getAuthBearerToken('cscstudentusera', 'password');
        cscStudentBToken = await getAuthBearerToken('cscstudentuserb', 'password');
    });

    it('Should let student book interview', async () => {
        const interview = await Interview.findOne({
            where: {
                task_id: 1,
                group_id: null
            }
        });
    
        const formattedDate = moment.utc(interview.date).format('YYYY-MM-DD'); // Format date in UTC
        const formattedTime = moment.utc(interview.time, 'HH:mm:ss').format('HH:mm:ss'); // Format time in UTC
    
        const localpayload = {
            task: 1,
            time: `${formattedDate} ${formattedTime}`, // Combine into correct format
            location: interview.location
        };
    
        const res = await chai.request(BASE_API_URL)
            .post(interviewStudentBookEndpoint(1))
            .set('Authorization', cscStudentBToken)
            .send(localpayload);
    
        expect(res).to.have.status(200);
    });
    

    it('Should not let student book interview if they already have one', (done) => {
        chai.request(BASE_API_URL)
            .post(interviewStudentBookEndpoint(1))
            .set('Authorization', cscStudentAToken)
            .send(payload[0])
            .end((err, res) => {
                expect(res).to.have.status(409);
                done();
            });
    });


    after(async () => {
    });
});
