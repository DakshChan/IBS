const { BASE_API_URL } = require("./constants");
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

/**
 * Helper function that logs into the account with the given username and password and
 * returns the auth token
 * @param username the username of the account to log into
 * @param password the password to use to log into
 * @return an auth token in the form of "Bearer: <token>"
 */
async function getAuthBearerToken(username, password) {
    const loginResponse = await chai.request(BASE_API_URL)
        .post('/auth/login')
        .send({
            username,
            password
        });
    chai.expect(loginResponse).to.have.status(200);
    return `Bearer ${loginResponse.body.token}`;
}

module.exports = {
    getAuthBearerToken,
}