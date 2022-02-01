const jwt = require("jsonwebtoken");
const moment = require("moment");
require("moment-timezone");
const fs = require("fs");
const json2csv = require("json2csv");
const bent = require("bent")
const getJSON = bent("json")
const transporter = require("../setup/email");

function generateAccessToken(group) {
	return jwt.sign(group, process.env.TOKEN_SECRET, { expiresIn: "1h" });
}

function generateTaAccessToken(ta, task) {
	return jwt.sign({ ta: ta, type: "ta", task: task }, process.env.TOKEN_SECRET, { expiresIn: "30d" });
}

function name_validate(name) {
	let regex_name = new RegExp("^[0-9a-zA-Z_]{1,30}$");

	if (!regex_name.test(name)) {
		return 1;
	}
	return 0;
}

function string_validate(string) {
	let regex_string = new RegExp("^[0-9a-zA-Z_ \.]{1,500}$");

	if (!regex_string.test(string)) {
		return 1;
	}
	return 0;
}

function number_validate(number) {
	let regex_number = new RegExp("^[0-9]{9,10}$");

	if (!regex_number.test(number)) {
		return 1;
	}
	return 0;
}

function date_validate(date) {
	let regex = new RegExp("^([12][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))$");

	if (!regex.test(date) || !moment(date, "YYYY-MM-DD", true).isValid()) {
		return 1;
	} else {
		return 0;
	}
}

function time_validate(time) {
	let regex = new RegExp("^([12][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])) (([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9])$");

	if (!regex.test(time) || !moment(time.substring(0, 10), "YYYY-MM-DD", true).isValid()) {
		return 1;
	} else {
		return 0;
	}
}

function query_filter(query, ta="") {
	let filter = "";
	if ("id" in query && !isNaN(query["id"]) && query["id"].trim() != "") {
		filter = filter + " AND id = " + query["id"];
	}
	if ("time" in query && !time_validate(query["time"])) {
		filter = filter + " AND time = '" + query["time"] + " America/Toronto'";
	}
	if ("date" in query && !date_validate(query["date"])) {
		filter = filter + " AND time BETWEEN '" + query["date"] + " America/Toronto'::date AND '" + query["date"] + " America/Toronto'::date + INTERVAL '24 HOURS'";
	}
	if ("student" in query && !name_validate(query["student"])) {
		filter = filter + " AND student = '" + query["student"] + "'";
	}
	if ("length" in query && !isNaN(query["length"]) && query["length"].trim() != "") {
		filter = filter + " AND length = " + query["length"];
	}
	if ("location" in query && !string_validate(query["location"])) {
		filter = filter + " AND location = '" + query["location"] + "'";
	}
	if ("cancelled" in query && (query["cancelled"].toLowerCase() === "true" || query["cancelled"].toLowerCase() === "false")) {
		filter = filter + " AND cancelled = '" + query["cancelled"].toLowerCase() + "'";
	}
	if ("note" in query && !string_validate(query["note"])) {
		filter = filter + " AND note = '" + query["note"] + "'";
	}
	if ("booked" in query ){
		if (query["booked"].toLowerCase() === "true"){
			filter = filter + " AND student IS NOT NULL";
		} else if (query["booked"].toLowerCase() === "false"){
			filter = filter + " AND student IS NULL";
		}
	}
	if (ta != ""){
		if ("ta" in query && !name_validate(query["ta"])) {
			if (query["ta"].toLowerCase() != "all"){
				filter = filter + " AND ta = '" + query["ta"] + "'";
			} 
		} else {
			filter = filter + " AND ta = '" + ta + "'";
		}
	}
	return filter;
}

function query_set(query) {
	let set = "";
	if ("set_time" in query && !time_validate(query["set_time"])) {
		set = set + " time = '" + query["set_time"] + " America/Toronto',";
	}
	if ("set_length" in query && !isNaN(query["set_length"]) && query["set_length"].trim() != "") {
		set = set + " length = " + query["set_length"] + ",";
	}
	if ("set_location" in query && !string_validate(query["set_location"])) {
		set = set + " location = '" + query["set_location"] + "',";
	}
	if ("set_cancelled" in query && (query["set_cancelled"].toLowerCase() === "true" || query["set_cancelled"].toLowerCase() === "false")) {
		set = set + " cancelled = '" + query["set_cancelled"].toLowerCase() + "',";
	}
	if ("set_note" in query && !string_validate(query["set_note"])) {
		set = set + " note = '" + query["set_note"] + "',";
	}
	return set;
}

function send_email(email, subject, body) {
	let mailOptions = {
		from: "Han Xian Xu Huang <" + process.env.EMAIL_USER + ">",
		to: email,
		subject: subject,
		text: "(Please do not reply to this email, as no one monitors it. Post your question to Discord or Piazza instead.)\n\n" + body
	};

	transporter.sendMail(mailOptions, function (error, info) { if (error) { console.log(error); } });
}

function send_csv(json, res, backup, note = "") {
	if (JSON.stringify(json) === "[]") {
		res.status(200).json({ message: "No data is available." });
		return;
	}

	let current_time = moment().tz("America/Toronto");
	let dir_date = current_time.format("YYYY") + "/" + current_time.format("MM") + "/" + current_time.format("DD") + "/";

	if (backup) {
		var dir = __dirname + "/../backup/" + dir_date;
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	} else {
		var dir = __dirname + "/../tmp/" + dir_date;
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	}

	let json2csvParser = new json2csv.Parser();
	let file_name = "interviews_" + current_time.format("YYYY-MM-DD-HH-mm-ss") + ((note === "") ? "" : "_") + note + ".csv";
	let csv = json2csvParser.parse(json);
	fs.writeFile(dir + file_name, csv, (err) => {
		if (err) {
			res.status(404).json({ message: "Unknown error." });
		} else {
			if (backup) {
				res.sendFile(file_name, { root: "./backup/" + dir_date, headers: { "Content-Disposition": "attachment; filename=" + file_name } });
			} else {
				res.sendFile(file_name, { root: "./tmp/" + dir_date, headers: { "Content-Disposition": "attachment; filename=" + file_name } });
			}
		}
	});
}

async function get_users_information(user_group, markus_id) {
	try {
		let groups = await getJSON(process.env.MARKUS_API + "assignments/" + markus_id + "/groups.json", null, { "Authorization": "MarkUsAuth " + process.env.MARKUS_AUTH });

		let users_requests = [];
		for (let group of groups) {
			if (group["group_name"] === user_group) {
				for (let member of group["members"]) {
					if (member["membership_status"] === "accepted" || member["membership_status"] === "inviter") {
						users_requests.push(await getJSON(process.env.MARKUS_API + "users/" + member["user_id"] + ".json", null, { "Authorization": "MarkUsAuth " + process.env.MARKUS_AUTH }));
					}
				}
			}
		}
		let users = await Promise.all(users_requests);
		return { status: true, users: users };
	} catch (e) {
		return { status: false };
	}
}

module.exports = {
	generateAccessToken: generateAccessToken,
	generateTaAccessToken: generateTaAccessToken,
	name_validate: name_validate,
	number_validate: number_validate,
	string_validate: string_validate,
	date_validate: date_validate,
	time_validate: time_validate,
	query_filter: query_filter,
	query_set: query_set,
	send_email: send_email,
	send_csv: send_csv,
	get_users_information: get_users_information
}