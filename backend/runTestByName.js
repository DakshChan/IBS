const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testCaseName = process.argv[2].padStart(2, '0');
const testFilePath = `tests/tc_${testCaseName}*.js`;
const seederFilePath = `seeders/sd_${testCaseName}.js`;

console.log(`Running test case ${testCaseName}`);
console.log(`testFilePath: ${testFilePath}`);
console.log(`seederFilePath: ${seederFilePath}`);

try {
    // Migrate Undo
    console.log('Reverting migrations...');
    execSync('npm run migrateundo', { stdio: 'inherit' });

    // Migrate
    console.log('Applying migrations...');
    execSync('npm run migrate', { stdio: 'inherit' });

    // Seed Data if Seeder File Exists
    if (fs.existsSync(seederFilePath)) {
        console.log('Seeding data...');
        execSync(`npm run seed ${seederFilePath}`, { stdio: 'inherit' });
    } else {
        console.log('No seeder file found, skipping seeding step.');
    }

    // Execute Test
    console.log('Executing test...');
    execSync(`npm run execute ${testFilePath}`, { stdio: 'inherit' });

} catch (error) {
    console.error('Error occurred:', error);
}
