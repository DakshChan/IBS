const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_DIRECTORY = './tests'
const EXEC_SYNC_OPTS = {};

function runTestByName(testCaseName) {
    const testFilePath = `tests/tc_${testCaseName}.js`;
    const seederFilePath = `seeders/sd_${testCaseName}.js`;

    try {
        console.log(`RUNNING ${testFilePath}`)

        console.log('Reverting migrations & Reapplying Migrations...');
        execSync('npm run migrateundo', EXEC_SYNC_OPTS);
        execSync('npm run migrate', EXEC_SYNC_OPTS);

        // Seed Data if Seeder File Exists
        if (fs.existsSync(seederFilePath)) {
            console.log('Seeding data...');
            execSync(`npm run seed ${seederFilePath}`, EXEC_SYNC_OPTS);
        } else {
            console.log('No seeder file found, skipping seeding step.');
        }

        execSync(`npm run execute ${testFilePath}`, { stdio: 'inherit' });
    } catch (err) {
        console.error("Error occurred: ", err);
    }

}

function runAllTests() {
    try {
        const testFiles = fs.readdirSync(TEST_DIRECTORY);

        testFiles.forEach((file) => {
            const filePath = path.join(TEST_DIRECTORY, file);

            const fileStats = fs.statSync(filePath);

            if (!file.startsWith("tc_") || !fileStats.isFile()) return;

            const tcName = file.substring(3, file.length - 3);  // removing 'tc_' prefix and '.js' postfix
            runTestByName(tcName);
        })
    } catch (err) {
        console.error("Error occurred: ", err);
    }
}

function main() {

    if (process.argv.length === 3) {
        switch (process.argv[2]) {
            case 'verbose':
                EXEC_SYNC_OPTS.stdio = 'inherit';
                break;
            case 'help':
                console.log("usage: npm run test:all [verbose|help]");
                return;
        }
    }

    runAllTests();
}

main();


