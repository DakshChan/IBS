const jwt = require('jsonwebtoken');
const moment = require('moment');
require('moment-timezone');
const fs = require('fs');
const json2csv = require('json2csv');
const axios = require('axios');
const transporter = require('../setup/email');
const db = require('../setup/db');
const { Task, GroupUser, Group, User } = require("../models");

const { VersionControlSystem } = require("../lib/version_control");
const {GROUP_STATUS} = require("../helpers/constants");

const JWT_EXPIRY = '120m';

// A few helper functions used the old gitlab helpers
const gitlab_get_user_id = VersionControlSystem.get_user_id;
const gitlab_create_group_and_project_no_user = VersionControlSystem.create_group_and_project_no_user;
const gitlab_create_group_and_project_with_user = VersionControlSystem.create_group_and_project_with_user;
const gitlab_add_user_with_gitlab_group_id = VersionControlSystem.add_user_with_group_id;
const gitlab_add_user_without_gitlab_group_id = VersionControlSystem.add_user_to_new_group;
const gitlab_remove_user = VersionControlSystem.remove_user_from_group;
const gitlab_get_commits = VersionControlSystem.get_commits;

function generateAccessToken(username, email, admin, roles) {
    return jwt.sign(
        { username: username, email: email, admin: admin, roles: roles },
        process.env.TOKEN_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

function name_validate(name) {
    let regex_name = new RegExp('^[0-9a-zA-Z_-]{1,30}$');

    if (!regex_name.test(name)) {
        return 1;
    }
    return 0;
}

function string_validate(string) {
    let regex_string = new RegExp('^[0-9a-zA-Z:_ \\,\\.\\/\\-\\(\\)\\!\\?]{1,500}$');

    if (!regex_string.test(string)) {
        return 1;
    }
    return 0;
}

/**
 * Return true if accumulated weight of all tasks in course with course_id exceeds 100.
 * Otherwise, return false.
 * @param new_task_weight number
 * @param course_id string
 * @returns {Promise<number>}
 */
async function weight_validate(new_task_weight, course_id) {
    try {
        // Find the sum of weights of all tasks for the given course_id
        const totalWeight = await Task.sum('weight', {
            where: { course_id }
        });

        // Calculate the total weight including the new task's weight
        const updatedTotalWeight = totalWeight + new_task_weight;

        // Check if the updated total weight exceeds 100
        return updatedTotalWeight > 100 ? 1 : 0;
    } catch (error) {
        console.error("Error validating task weight:", error);
        return 1; // Return 1 indicating an error condition
    }
}

/**
 * Return true if accumulated weight of all tasks minus the old weight of the task being changed in course with course_id exceeds 100.
 * Otherwise, return false.
 */
async function new_weight_validate(new_weight, course_id, task_name) {
    let pg_res_task = await db.query(
        'SELECT sum(weight) AS total_weight FROM course_' + course_id + '.task'
    );
    let total_weight = pg_res_task.rows[0].total_weight || 0;
    let curr_weight = await get_task_weight(course_id, task_name);
    if (typeof total_weight === 'string') {
        total_weight = parseInt(total_weight);
    }
    if (typeof curr_weight === 'string') {
        curr_weight = parseInt(curr_weight);
    }
    return total_weight + new_weight - curr_weight > 100 ? 1 : 0;
}

function boolean_validate(string) {
    if (string !== true && string !== false && string !== 'true' && string !== 'false') {
        return 1;
    }
    return 0;
}

function number_validate(number) {
    if (number === null || isNaN(Number(number)) || number.toString().trim() === '') {
        return 1;
    }
    return 0;
}

function email_validate(email) {
    let regex_email = new RegExp('.@.');
    ///^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (!regex_email.test(email)) {
        return 1;
    }
    return 0;
}

function date_validate(date) {
    let regex = new RegExp('^([12][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))$');

    if (!regex.test(date) || !moment(date, 'YYYY-MM-DD', true).isValid()) {
        return 1;
    } else {
        return 0;
    }
}

function time_validate(time) {
    let regex = new RegExp(
        '^([12][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])) (([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9])$'
    );

    if (!regex.test(time) || !moment(time.substring(0, 10), 'YYYY-MM-DD', true).isValid()) {
        return 1;
    } else {
        return 0;
    }
}

function password_validate(password) {
    let regex = new RegExp('.{8,72}');
    if (!regex.test(password)) {
        return 1;
    } else {
        return 0;
    }
}

async function task_validate(course_id, task, student) {
    try {
        let whereCondition = { task, course_id };
        if (student) {
            whereCondition.hidden = false;
        }

        // Find the task based on the conditions
        const taskDetails = await Task.findOne({
            where: whereCondition,
            raw: true // Fetch raw data without model instances
        });

        if (!taskDetails) {
            return { task: '' };
        } else {
            // Extract required fields from the taskDetails object
            const { change_group, hide_interview, hide_file, interview_group } = taskDetails;
            return {
                task,
                change_group,
                hide_interview,
                hide_file,
                interview_group
            };
        }
    } catch (error) {
        console.error("Error validating task:", error);
        return { task: '' };
    }
}

function interview_data_filter(query, start_data_id, others_interview, username) {
    let filter = '';
    let data = [];
    let data_id = start_data_id;

    if ('interview_id' in query && !number_validate(query['interview_id'])) {
        filter = filter + ' AND interview_id = ($' + data_id + ')';
        data_id += 1;
        data.push(query['interview_id']);
    }
    if ('booked' in query && !boolean_validate(query['booked'])) {
        if (query['booked'] === 'true' || query['booked'] === true) {
            filter = filter + ' AND group_id IS NOT NULL';
        }
    }
    if ('time' in query && !time_validate(query['time'])) {
        filter = filter + ' AND time = ($' + data_id + ')';
        data_id += 1;
        data.push(query['time'] + ' America/Toronto');
    }
    if ('date' in query && !date_validate(query['date'])) {
        filter =
            filter +
            ' AND time BETWEEN ($' +
            data_id +
            ') AND ($' +
            data_id +
            ") + INTERVAL '24 HOURS'";
        data_id += 1;
        data.push(query['date'] + ' America/Toronto');
    }
    if ('group_id' in query && !number_validate(query['group_id'])) {
        filter = filter + ' AND group_id = ($' + data_id + ')';
        data_id += 1;
        data.push(query['group_id']);
    }
    if ('length' in query && !number_validate(query['length'])) {
        filter = filter + ' AND length = ($' + data_id + ')';
        data_id += 1;
        data.push(query['length']);
    }
    if ('location' in query && !string_validate(query['location'])) {
        filter = filter + ' AND location = ($' + data_id + ')';
        data_id += 1;
        data.push(query['location']);
    }
    if ('note' in query && !string_validate(query['note'])) {
        filter = filter + ' AND note = ($' + data_id + ')';
        data_id += 1;
        data.push(query['note']);
    }
    if ('cancelled' in query && !boolean_validate(query['cancelled'])) {
        filter = filter + ' AND cancelled = ($' + data_id + ')';
        data_id += 1;
        data.push(query['cancelled']);
    }

    if (others_interview && 'host' in query && !name_validate(query['host'])) {
        // potentially return other's interview
        if (query['host'] !== 'all') {
            filter = filter + ' AND host = ($' + data_id + ')';
            data_id += 1;
            data.push(query['host']);
        }
    } else {
        // restrict to user's interview
        filter = filter + ' AND host = ($' + data_id + ')';
        data_id += 1;
        data.push(username);
    }

    return { filter: filter, data: data, data_id: data_id };
}

function interview_data_set_new(query, start_data_id) {
    let set = '';
    let data = [];
    let data_id = start_data_id;

    if ('set_time' in query && !time_validate(query['set_time'])) {
        set = set + ' time = ($' + data_id + '),';
        data_id += 1;
        data.push(query['set_time'] + ' America/Toronto');
    }
    if ('set_group_id' in query && !number_validate(query['set_group_id'])) {
        set = set + ' group_id = ($' + data_id + '),';
        data_id += 1;
        data.push(query['set_group_id']);
    }
    if ('set_length' in query && !number_validate(query['set_length'])) {
        set = set + ' length = ($' + data_id + '),';
        data_id += 1;
        data.push(query['set_length']);
    }
    if ('set_location' in query && !string_validate(query['set_location'])) {
        set = set + ' location = ($' + data_id + '),';
        data_id += 1;
        data.push(query['set_location']);
    }
    if ('set_note' in query && !string_validate(query['set_note'])) {
        set = set + ' note = ($' + data_id + '),';
        data_id += 1;
        data.push(query['set_note']);
    }
    if ('set_cancelled' in query && !boolean_validate(query['set_cancelled'])) {
        set = set + ' cancelled = ($' + data_id + '),';
        data_id += 1;
        data.push(query['set_cancelled']);
    }
    return { set: set, data: data, data_id: data_id };
}

function send_email(email, subject, body) {
    let mailOptions = {
        from: 'IBS <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: subject,
        text: body + '\n\n This is an autogenerated email. Please do not reply.',
        html:
            '<p>' +
            body +
            '</p> <br /> <br /> <hr /> <i>This is an autogenerated email. Please do not reply.</i>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Email error:' + error);
        }
    });
}

async function send_email_by_group(course_id, group_id, subject, body) {
    let group_emails = '';
    const group_members = await GroupUser.findAll({
        attributes: ['username'],
        where: {
            group_id: group_id,
            status: GROUP_STATUS.confirmed
        }
    });

    for (let row of group_members) {
        const user = await User.findOne({
            attributes: ['email'],
            where: {
                username: row['username']
            }
        })

        group_emails = group_emails + user.email + ', ';
    }

    await send_email(group_emails, subject, body);
}

function search_files(username, group_id, coure_id, sub_dir = '') {
    let dir = __dirname + '/../files/course_' + coure_id + '/' + sub_dir;
    let result = [];

    if (!fs.existsSync(dir)) {
        return result;
    }

    let files = fs.readdirSync(dir);

    for (let i = 0; i < files.length; i++) {
        let file_name = dir + files[i];
        let stat = fs.lstatSync(file_name);

        if (stat.isDirectory()) {
            result = result.concat(
                search_files(username, group_id, coure_id, sub_dir + files[i] + '/')
            );
        } else if (
            file_name.indexOf(username + '_') >= 0 ||
            file_name.indexOf('group_' + group_id + '_') >= 0
        ) {
            result.push(sub_dir + files[i]);
        }
    }

    return result;
}

async function get_courses() {
    let pg_res = await db.query('SELECT * FROM course ORDER BY course_id', []);

    let courses = {};
    for (let row of pg_res.rows) {
        let course = {};
        course['course_code'] = row['course_code'];
        course['course_session'] = row['course_session'];

        courses[row['course_id']] = course;
    }

    return courses;
}

async function get_tasks(course_id) {
    let pg_res = await db.query(
        'SELECT * FROM course_' + course_id + '.task ORDER BY due_date, task',
        []
    );

    let tasks = {};
    for (let row of pg_res.rows) {
        let task = {};
        task['due_date'] = row['due_date'];
        task['hidden'] = row['hidden'];
        task['weight'] = row['weight'];
        task['min_member'] = row['min_member'];
        task['max_member'] = row['max_member'];

        tasks[row['task']] = task;
    }

    return tasks;
}

async function get_criteria_id(course_id, task, criteria) {
    let pg_res = await db.query(
        'SELECT * FROM course_' + course_id + '.criteria WHERE task = ($1) AND criteria = ($2)',
        [task, criteria]
    );

    if (pg_res.rowCount === 0) {
        return -1;
    } else {
        return pg_res.rows[0]['criteria_id'];
    }
}

async function get_criteria(course_id, task) {
    let pg_res = await db.query(
        'SELECT * FROM course_' + course_id + '.criteria WHERE task = ($1)',
        [task]
    );

    let all_criteria = {};
    for (let row of pg_res.rows) {
        let criteria = {};
        criteria['task'] = row['task'];
        criteria['criteria'] = row['criteria'];
        criteria['total'] = parseFloat(row['total']);
        criteria['description'] = row['description'];

        all_criteria[row['criteria_id']] = criteria;
    }

    return all_criteria;
}

async function get_total_out_of(course_id) {
    let pg_res = await db.query(
        'SELECT task, SUM(total) AS sum FROM course_' + course_id + '.criteria GROUP BY task',
        []
    );

    let total_out_of = {};
    for (let row of pg_res.rows) {
        total_out_of[row['task']] = parseFloat(row['sum']);
    }

    return total_out_of;
}

async function get_group_task(course_id, group_id) {
    let pg_res = await db.query(
        'SELECT task FROM course_' + course_id + '.group WHERE group_id = ($1)',
        [group_id]
    );

    if (pg_res.rowCount == 0) {
        return '';
    } else {
        return pg_res.rows[0]['task'];
    }
}

async function get_group_id(course_id, task, username) {
    let pg_res = await db.query(
        'SELECT group_id FROM course_' +
            course_id +
            ".group_user WHERE task = ($1) AND username= ($2) AND status = 'confirmed'",
        [task, username]
    );

    if (pg_res.rowCount == 0) {
        return -1;
    } else {
        return pg_res.rows[0]['group_id'];
    }
}

async function get_group_users(course_id, group_id) {
    let results = [];
    let pg_res = await db.query(
        'SELECT * FROM course_' +
            course_id +
            ".group_user WHERE group_id = ($1) AND status = 'confirmed'",
        [group_id]
    );

    for (let row of pg_res.rows) {
        results.push(row['username']);
    }
    return results;
}

async function get_all_group_users(course_id, task) {
    let results = {};
    let pg_res = await db.query(
        'SELECT * FROM course_' +
            course_id +
            ".group_user WHERE task = ($1) AND status = 'confirmed'",
        [task]
    );

    for (let row of pg_res.rows) {
        if (row['group_id'] in results) {
            results[row['group_id']].push(row['username']);
        } else {
            results[row['group_id']] = [row['username']];
        }
    }
    return results;
}

async function copy_groups(course_id, from_task, to_task) {
    let results = [];
    let group_user = {};

    const originalTask = await Task.findOne({ where: { course_id, task: from_task } });
    const oldGroupUsers = await GroupUser.findAll({
        where: {
            task_id: originalTask.id,
            status: GROUP_STATUS.confirmed
        }
    });

    const newTask = await Task.findOne({ where: { course_id, task: to_task } });

    for (let row of oldGroupUsers) {
        // Check if the user already has a group in to_task
        const newGroupUsers = await GroupUser.findAll({
            where: {
                task_id: newTask.id,
                username: row.username
            }
        })

        if (newGroupUsers.length === 0) {
            if (row['group_id'] in group_user) {
                group_user[row['group_id']].push(row['username']);
            } else {
                group_user[row['group_id']] = [row['username']];
            }
        }
    }

    for (let old_group_id in group_user) {
        // Add a new group in db
        const newGroup = await Group.create({ task_id: newTask.id });

        const new_group_id = newGroup.group_id;

        // Create a new project on gitlab for the new group
        let add_project = await gitlab_create_group_and_project_no_user(
            course_id,
            new_group_id,
            to_task
        );

        if (add_project['success'] === false) {
            results.push({ group_id: old_group_id, code: add_project['code'] });
        } else {
            for (let user of group_user[old_group_id]) {
                // Add user to the new group in db
                try {
                    await GroupUser.create({
                        task_id: newTask.id,
                        username: user,
                        group_id: new_group_id,
                        status: GROUP_STATUS.confirmed
                    });

                    // Add user to the new project on gitlab
                    const add_user = await gitlab_add_user_with_gitlab_group_id(
                        add_project['gitlab_group_id'],
                        '',
                        user
                    );
                    if (add_user['success'] === false) {
                        results.push({ username: user, code: add_user['code'] });
                    }
                } catch (e) {
                    console.log('User ' + user + 'is already in a group');
                }
            }
        }
    }

    return results;
}

async function format_marks_one_task(json, course_id, task, total) {
    let marks = {};
    let all_criteria = await get_criteria(course_id, task);

    for (let row of json) {
        let username = row['username'];
        if (!(username in marks)) {
            marks[username] = {};
            for (let criteria in all_criteria) {
                marks[username][all_criteria[criteria]['criteria']] = {
                    mark: 0,
                    out_of: all_criteria[criteria]['total']
                };
            }
        }

        let criteria_name = all_criteria[row['criteria_id']]['criteria'];
        marks[username][criteria_name]['mark'] = parseFloat(row['mark']);
    }

    if (total) {
        for (let username in marks) {
            let temp_total = 0;
            let temp_out_of = 0;
            for (let criteria in marks[username]) {
                temp_total += marks[username][criteria]['mark'];
                temp_out_of += marks[username][criteria]['out_of'];
            }
            marks[username]['Total'] = { mark: temp_total, out_of: temp_out_of };
        }
    }

    return marks;
}

/**
 * Given course_id and task_name, return the task weight belonging to said task_name.
 * @param course_id string
 * @param task_name string
 * @returns {Promise<*|string>}
 */
async function get_task_weight(course_id, task_name) {
    let pg_res = await db.query(
        'SELECT weight FROM course_' + course_id + '.task WHERE task = ($1)',
        [task_name]
    );

    if (pg_res.rowCount === 0) {
        return '';
    } else {
        return pg_res.rows[0]['weight'];
    }
}

async function format_marks_all_tasks(json, course_id) {
    let marks = {};
    let total_out_of = await get_total_out_of(course_id);

    for (let row of json) {
        let username = row['username'];
        if (!(username in marks)) {
            marks[username] = {};
            for (let task in total_out_of) {
                const task_weight = await get_task_weight(course_id, row['task']);
                marks[username][task] = {
                    mark: 0,
                    out_of: total_out_of[task],
                    weight: task_weight
                };
            }
        }

        marks[username][row['task']]['mark'] = parseFloat(row['sum']);
    }
    return marks;
}

async function format_marks_one_task_csv(json, course_id, task, res, total) {
    if (JSON.stringify(json) === '[]') {
        res.status(200).json({ message: 'No data is available.' });
        return;
    }

    let current_time = moment().tz('America/Toronto');
    let dir_date =
        current_time.format('YYYY') +
        '/' +
        current_time.format('MM') +
        '/' +
        current_time.format('DD') +
        '/';
    let dir = __dirname + '/../backup/' + dir_date;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let json2csvParser = new json2csv.Parser({ defaultValue: '0' });
    let file_name = 'marks_' + current_time.format('YYYY-MM-DD-HH-mm-ss') + '.csv';
    let header = { Student: 'Out Of' };
    let parsed_json = {};
    let marks = await format_marks_one_task(json, course_id, task, false);

    if (Object.keys(marks).length === 0) {
        res.status(200).json({ message: 'No mark is available.' });
        return;
    }

    for (let student in marks) {
        for (let criteria in marks[student]) {
            if (!(criteria in header)) {
                header[criteria] = marks[student][criteria]['out_of'];
            }

            let mark = marks[student][criteria]['mark'];
            if (student in parsed_json) {
                parsed_json[student][criteria] = mark;
            } else {
                parsed_json[student] = { Student: student, [criteria]: mark };
            }
        }
    }

    let rows = [header].concat(Object.values(parsed_json));

    if (total) {
        for (let row of rows) {
            let row_total = 0;
            for (let criteria of Object.keys(row)) {
                if (criteria != 'Student') {
                    row_total += row[criteria];
                }
            }
            row['Total'] = row_total;
        }
    }

    let csv = json2csvParser.parse(rows);
    fs.writeFile(dir + file_name, csv, (err) => {
        if (err) {
            res.status(404).json({ message: 'Unknown error.' });
        } else {
            res.sendFile(file_name, {
                root: './backup/' + dir_date,
                headers: { 'Content-Disposition': 'attachment; filename=' + file_name }
            });
        }
    });
}

async function format_marks_all_tasks_csv(json, course_id, res, total) {
    if (JSON.stringify(json) === '[]') {
        res.status(200).json({ message: 'No data is available.' });
        return;
    }

    let current_time = moment().tz('America/Toronto');
    let dir_date =
        current_time.format('YYYY') +
        '/' +
        current_time.format('MM') +
        '/' +
        current_time.format('DD') +
        '/';
    let dir = __dirname + '/../backup/' + dir_date;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let json2csvParser = new json2csv.Parser({ defaultValue: '0' });
    let file_name = 'marks_' + current_time.format('YYYY-MM-DD-HH-mm-ss') + '.csv';
    let header = { Student: 'Out Of' };
    let parsed_json = {};
    let marks = await format_marks_all_tasks(json, course_id, total);

    if (Object.keys(marks).length === 0) {
        res.status(200).json({ message: 'No mark is available.' });
        return;
    }

    for (let student in marks) {
        for (let task in marks[student]) {
            if (!(task in header)) {
                header[task] = marks[student][task]['out_of'];
            }

            let mark = marks[student][task]['mark'];
            if (student in parsed_json) {
                parsed_json[student][task] = mark;
            } else {
                parsed_json[student] = { Student: student, [task]: mark };
            }
        }
    }

    let rows = [header].concat(Object.values(parsed_json));

    let csv = json2csvParser.parse(rows);
    fs.writeFile(dir + file_name, csv, (err) => {
        if (err) {
            res.status(404).json({ message: 'Unknown error.' });
        } else {
            res.sendFile(file_name, {
                root: './backup/' + dir_date,
                headers: { 'Content-Disposition': 'attachment; filename=' + file_name }
            });
        }
    });
}

async function get_max_user_tokens(course_id, username) {
    let pg_res_default_tokens = await db.query(
        'SELECT default_token_count, token_length FROM course WHERE course_id = ($1)',
        [course_id]
    );
    let pg_res_user_tokens = await db.query(
        'SELECT token_count FROM course_' + course_id + '.user WHERE username = ($1)',
        [username]
    );
    if (pg_res_default_tokens.rowCount !== 1 || pg_res_user_tokens.rowCount !== 1) {
        return { token_count: -1, token_length: -1 };
    }

    let token_count = -1;
    if (pg_res_user_tokens.rows[0]['token_count'] !== -1) {
        token_count = pg_res_user_tokens.rows[0]['token_count'];
    } else {
        token_count = pg_res_default_tokens.rows[0]['default_token_count'];
    }

    let token_length = pg_res_default_tokens.rows[0]['token_length'];

    return {
        token_count: token_count,
        token_length: token_length,
        total: token_count * token_length
    };
}

async function get_user_token_usage(course_id, username) {
    let groups = [];
    let usage = {};

    let pg_res_groups = await db.query(
        'SELECT group_id FROM course_' + course_id + '.group_user WHERE username = ($1)',
        [username]
    );
    for (let row of pg_res_groups.rows) {
        groups.push(row['group_id']);
    }

    let pg_res_submission = await db.query(
        'SELECT * FROM course_' + course_id + '.submission WHERE group_id = ANY($1::int[])',
        [groups]
    );
    for (let row of pg_res_submission.rows) {
        usage[row['task']] = row['token_used'];
    }

    return usage;
}

async function get_due_date(course_id, group_id) {
    let max_token = Infinity;
    let token_length = 0;
    let due_date = null;
    let due_date_with_extension = null;
    let due_date_with_extension_and_token = null;

    // Get task
    let pg_res_group = await db.query(
        'SELECT task, extension FROM course_' + course_id + '.group WHERE group_id = ($1)',
        [group_id]
    );
    if (pg_res_group.rowCount !== 1) {
        return { due_date: null };
    }
    let task = pg_res_group.rows[0]['task'];

    // Get original due date
    let pg_res_due_date = await db.query(
        'SELECT due_date, max_token, task_group_id FROM course_' +
            course_id +
            '.task WHERE task = ($1)',
        [task]
    );
    if (pg_res_due_date.rowCount !== 1) {
        return { due_date: null };
    }
    due_date = moment(pg_res_due_date.rows[0]['due_date']).tz('America/Toronto');

    // Apply group extension to due date if applicable
    let group_extension = 0;
    if (pg_res_group.rows[0]['extension'] !== null) {
        group_extension = pg_res_group.rows[0]['extension'];
    }
    due_date_with_extension = moment(pg_res_due_date.rows[0]['due_date'])
        .tz('America/Toronto')
        .add(group_extension, 'minutes');

    // Get max token of the task group if applicable
    let max_task_group_token = Infinity;
    let task_group_id = pg_res_due_date.rows[0]['task_group_id'];
    if (task_group_id !== null) {
        let pg_res_task_group = await db.query(
            'SELECT max_token FROM course_' + course_id + '.task_group WHERE task_group_id = ($1)',
            [task_group_id]
        );
        if (pg_res_task_group.rowCount !== 1) {
            return { due_date: null };
        }
        max_task_group_token = pg_res_task_group.rows[0]['max_token'];
    }

    // Get all tasks that are in the task group
    let task_group_all_tasks = [];
    if (task_group_id !== null) {
        let pg_res_task_group_all_tasks = await db.query(
            'SELECT task FROM course_' + course_id + '.task WHERE task_group_id = ($1)',
            [task_group_id]
        );
        if (pg_res_task_group_all_tasks.rowCount < 1) {
            return { due_date: null };
        }
        for (let row of pg_res_task_group_all_tasks.rows) {
            task_group_all_tasks.push(row['task']);
        }
    }

    // Get all group members
    let members = [];
    let pg_res_members = await db.query(
        'SELECT username FROM course_' + course_id + '.group_user WHERE group_id = ($1)',
        [group_id]
    );
    if (pg_res_members.rowCount < 1) {
        return {
            task: task,
            due_date: due_date.format('YYYY-MM-DD HH:mm:ss'),
            due_date_with_extension: due_date_with_extension.format('YYYY-MM-DD HH:mm:ss'),
            due_date_with_extension_and_token:
                due_date_with_extension.format('YYYY-MM-DD HH:mm:ss'),
            token_length: -1
        };
    }
    for (let row of pg_res_members.rows) {
        members.push(row['username']);
    }

    // Get how long the task can be extended by token
    for (let user of members) {
        // Get max token the task allows
        let max_task_token = pg_res_due_date.rows[0]['max_token'];

        // Get max token the user has
        let max_user_token_data = await get_max_user_tokens(course_id, user);
        let max_user_token = max_user_token_data['token_count'];
        token_length = max_user_token_data['token_length'];

        // Get user's token usage
        let used_user_token = 0;
        let used_task_group_token = 0;
        let usage = await get_user_token_usage(course_id, user);
        for (let item in usage) {
            if (item !== task) {
                used_user_token += usage[item];
                if (task_group_all_tasks.includes(item)) {
                    used_task_group_token += usage[item];
                }
            }
        }

        max_token = Math.min(
            max_token,
            max_task_token,
            max_user_token - used_user_token,
            max_task_group_token - used_task_group_token
        );
    }
    due_date_with_extension_and_token = due_date_with_extension
        .clone()
        .add(max_token * token_length, 'minutes');

    return {
        task,
        due_date: due_date.format('YYYY-MM-DD HH:mm:ss'),
        due_date_with_extension: due_date_with_extension.format('YYYY-MM-DD HH:mm:ss'),
        due_date_with_extension_and_token:
            due_date_with_extension_and_token.format('YYYY-MM-DD HH:mm:ss'),
        max_token,
        token_length
    };
}

async function get_submission_before_due_date(course_id, group_id) {
    let data = await gitlab_get_commits(course_id, group_id);
    let commit_commits = data['commit']; // the commit history
    let push_commits = data['push']; // the time when the commits were pushed (in case they modified the commit time manually)

    let due_date_data = await get_due_date(course_id, group_id);
    let task = due_date_data['task'];
    let due_date = due_date_data['due_date'];
    if (due_date === null) {
        return { due_date: null };
    }
    let due_date_with_extension = due_date_data['due_date_with_extension'];
    let due_date_with_extension_and_token = due_date_data['due_date_with_extension_and_token'];
    let max_token = due_date_data['max_token'];
    let token_length = due_date_data['token_length'];

    let last_commit_id = null;
    let last_commit_time = null;
    let push_time = null;
    let last_commit_time_utc = null;
    let last_commit_message = null;

    // Check if the due date has passed
    let before_due_date_with_extension_and_token = false;
    if (moment().isBefore(moment.tz(due_date_with_extension_and_token, 'America/Toronto'))) {
        before_due_date_with_extension_and_token = true;
    }

    // Get the last commit before due date
    for (let commit of commit_commits) {
        if (
            last_commit_id === null &&
            moment(commit['created_at']).isBefore(
                moment.tz(due_date_with_extension_and_token, 'America/Toronto')
            )
        ) {
            // The commit time is before the due date, but we also need to check the push time in case it's modified manually
            let verified = false;
            let forbidden = false;

            for (let push_commit of push_commits) {
                if (push_commit['action_name'] === 'pushed to') {
                    if (push_commit['push_data']['commit_to'] === commit['id']) {
                        if (
                            moment(push_commit['created_at']).isBefore(
                                moment.tz(due_date_with_extension_and_token, 'America/Toronto')
                            )
                        ) {
                            verified = true;
                            push_time = moment(push_commit['created_at'])
                                .tz('America/Toronto')
                                .format('YYYY-MM-DD HH:mm:ss');
                        } else {
                            forbidden = true;
                        }
                    }
                }
            }

            if (verified && !forbidden) {
                last_commit_id = commit['id'];
                last_commit_time = moment(commit['created_at'])
                    .tz('America/Toronto')
                    .format('YYYY-MM-DD HH:mm:ss');
                last_commit_time_utc = moment(commit['created_at']);
                last_commit_message = commit['message'];
            }
        }
    }

    // Calculate number of tokens to deduct
    let token_used = 0;
    if (last_commit_time_utc !== null) {
        let minutes_past_due_date_with_extension = moment
            .duration(
                last_commit_time_utc.diff(moment.tz(due_date_with_extension, 'America/Toronto'))
            )
            .asMinutes();
        if (minutes_past_due_date_with_extension > 0) {
            token_used = Math.ceil(minutes_past_due_date_with_extension / token_length);
        }
    }

    return {
        group_id,
        task,
        due_date,
        due_date_with_extension,
        due_date_with_extension_and_token,
        before_due_date_with_extension_and_token,
        max_token,
        token_length,
        commit_id: last_commit_id,
        commit_time: last_commit_time,
        push_time,
        commit_message: last_commit_message,
        token_used
    };
}

async function collect_one_submission(course_id, group_id, overwrite) {
    let task = await get_group_task(course_id, group_id);
    if (task === '') {
        return {
            message: "The group id doesn't exist.",
            group_id: group_id,
            code: 'group_not_exist'
        };
    }

    if (!overwrite) {
        let sql_check_submission =
            'SELECT * FROM course_' +
            course_id +
            '.submission WHERE task = ($1) AND group_id = ($2)';
        let sql_check_submission_data = [task, group_id];

        let err_check_submission,
            pg_res_check_submission = await db.query(
                sql_check_submission,
                sql_check_submission_data
            );
        if (err_check_submission) {
            return {
                message: 'Unknown error.',
                group_id: group_id,
                code: 'unknown_error',
                submission: submission_data
            };
        } else if (pg_res_check_submission.rowCount >= 1) {
            return {
                message:
                    'The new submission is not collected as an old submission is found and overwrite is false.',
                group_id: group_id,
                code: 'submission_exists',
                submission: pg_res_check_submission.rows[0]
            };
        }
    }

    let submission_data = await get_submission_before_due_date(course_id, group_id);
    if (submission_data['due_date'] === null) {
        return {
            message: 'Unknown error.',
            group_id: group_id,
            code: 'unknown_error',
            submission: submission_data
        };
    }
    if (submission_data['before_due_date_with_extension_and_token'] === true) {
        return {
            message: "Due date hasn't passed for this group.",
            group_id: group_id,
            code: 'before_due_date',
            submission: submission_data
        };
    }
    if (submission_data['commit_id'] === null) {
        return {
            message: 'No commit is found for this group.',
            group_id: group_id,
            code: 'no_commit',
            submission: submission_data
        };
    }

    let sql_add_submission =
        'INSERT INTO course_' +
        course_id +
        '.submission (task, group_id, commit_id, token_used) VALUES (($1), ($2), ($3), ($4))';
    let sql_add_submission_data = [
        submission_data['task'],
        group_id,
        submission_data['commit_id'],
        submission_data['token_used']
    ];

    if (overwrite) {
        sql_add_submission +=
            ' ON CONFLICT (group_id) DO UPDATE SET commit_id = EXCLUDED.commit_id, token_used = EXCLUDED.token_used';
    } else {
        sql_add_submission += ' ON CONFLICT (group_id) DO NOTHING';
    }

    let err_add_submission,
        pg_res_add_submission = await db.query(sql_add_submission, sql_add_submission_data);
    if (err_add_submission) {
        return {
            message: 'Unknown error.',
            group_id: group_id,
            code: 'unknown_error',
            submission: submission_data
        };
    } else if (pg_res_add_submission.rowCount === 0) {
        return {
            message:
                'The new submission is not collected as an old submission is found and overwrite is false.',
            group_id: group_id,
            code: 'submission_exists',
            submission: submission_data
        };
    } else {
        return {
            message: 'The new submission is collected.',
            group_id: group_id,
            code: 'submission_collected',
            submission: submission_data
        };
    }
}

async function collect_all_submissions(course_id, task, overwrite) {
    collect_processes = [];
    let pg_res = await db.query(
        'SELECT group_id FROM course_' +
            course_id +
            '.group_user WHERE task = ($1) GROUP BY group_id HAVING COUNT(username) >= 1',
        [task]
    );
    for (let row of pg_res.rows) {
        collect_processes.push(collect_one_submission(course_id, row['group_id'], overwrite));
    }

    let results = await Promise.all(collect_processes);

    let collected_count = 0;
    let empty_count = 0;
    let ignore_count = 0;
    let before_due_date_count = 0;
    let error_count = 0;
    let collected_groups = [];
    let empty_groups = [];
    let ignore_groups = [];
    let before_due_date_groups = [];
    let error_groups = [];

    for (let result of results) {
        let code = result['code'];
        let group_id = result['group_id'];

        if (code === 'submission_collected') {
            collected_count += 1;
            collected_groups.push(group_id);
        } else if (code === 'submission_exists') {
            ignore_count += 1;
            ignore_groups.push(group_id);
        } else if (code === 'no_commit') {
            empty_count += 1;
            empty_groups.push(group_id);
        } else if (code === 'before_due_date') {
            before_due_date_count += 1;
            before_due_date_groups.push(group_id);
        } else if (code === 'unknown_error') {
            error_count += 1;
            error_groups.push(group_id);
        }
    }

    return {
        collected_count,
        empty_count,
        ignore_count,
        before_due_date_count,
        error_count,
        collected_groups,
        empty_groups,
        ignore_groups,
        before_due_date_groups,
        error_groups
    };
}

async function download_all_submissions(course_id, task) {
    groups = [];
    let pg_res = await db.query(
        'SELECT group_id FROM course_' + course_id + '.group WHERE task = ($1)',
        [task]
    );
    for (let row of pg_res.rows) {
        let group_id = row['group_id'];
        let pg_res_gitlab_url = await db.query(
            'SELECT gitlab_project_id, gitlab_url FROM course_' +
                course_id +
                '.group WHERE group_id = ($1)',
            [group_id]
        );
        let pg_res_commit_id = await db.query(
            'SELECT commit_id FROM course_' + course_id + '.submission WHERE group_id = ($1)',
            [group_id]
        );

        let gitlab_url = pg_res_gitlab_url.rows[0]['gitlab_url'];
        let gitlab_project_id = pg_res_gitlab_url.rows[0]['gitlab_project_id'];
        if (gitlab_url !== null && gitlab_project_id !== null) {
            let regex = gitlab_url.match(/https:\/\/([^\/]*)\/(.*)/);
            let ssh_clone_url = 'git@' + regex[1] + ':' + regex[2] + '.git';

            if (pg_res_gitlab_url.rowCount === 1 && pg_res_commit_id.rowCount === 1) {
                groups.push({
                    group_name: 'group_' + group_id,
                    group_id: group_id,
                    gitlab_project_id: gitlab_project_id,
                    gitlab_url: gitlab_url,
                    https_clone_url: gitlab_url + '.git',
                    ssh_clone_url: ssh_clone_url,
                    commit_id: pg_res_commit_id.rows[0]['commit_id']
                });
            }
        }
    }

    return groups;
}

module.exports = {
    generateAccessToken,

    // Validation related
    name_validate,
    boolean_validate,
    number_validate,
    string_validate,
    date_validate,
    time_validate,
    email_validate,
    password_validate,
    task_validate,
    weight_validate,
    new_weight_validate,

    // Utility
    interview_data_filter,
    interview_data_set_new,
    send_email,
    send_email_by_group,
    get_courses,
    get_tasks,
    get_criteria_id,
    get_criteria,
    get_total_out_of,
    get_group_task,
    get_group_id,
    get_group_users,
    get_all_group_users,
    copy_groups,

    // Mark related
    format_marks_one_task,
    format_marks_all_tasks,
    format_marks_one_task_csv,
    format_marks_all_tasks_csv,

    // File related
    search_files,

    // Token related
    get_max_user_tokens,
    get_user_token_usage,
    get_due_date,

    // Submission related,
    get_submission_before_due_date,
    collect_one_submission,
    collect_all_submissions,
    download_all_submissions,

    // Gitlab related
    gitlab_get_user_id,
    gitlab_create_group_and_project_no_user,
    gitlab_create_group_and_project_with_user,
    gitlab_add_user_with_gitlab_group_id,
    gitlab_add_user_without_gitlab_group_id,
    gitlab_remove_user,
    gitlab_get_commits,
};
