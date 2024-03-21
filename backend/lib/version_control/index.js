const MockVCS = require("./MockVCS");
const GitLabVCS = require("./GitLabVCS");

const VCS_MAP = {
    gitlab: GitLabVCS,
    mock: MockVCS
}

const vcs = process.env.VERSION_CONTROL_SYSTEM || 'gitlab';  // Should be a key of VCS_MAP
const env = process.env.NODE_ENV || 'development';

const VersionControlSystem = env !== 'production' ? MockVCS : VCS_MAP[vcs];


module.exports = { VersionControlSystem };