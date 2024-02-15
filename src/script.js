const fs = require("fs");

const contextJson = fs.readFileSync("./context.json", "utf8");
const context = JSON.parse(contextJson);
console.log(context);
const issue = context.issue;
// console.log(issue);
const isClosed = issue.state === "closed";
// console.log(issue.labels);
// const hasLabel = issue.labels.map((label) => label.name).includes("Awaiting Approval");
const hasLabel = issue.labels.some((label) => label.name === "Awaiting Approval");
const hasSetupTag = issue.title.includes("[SETUP]");

if (isClosed && hasLabel && hasSetupTag) {
	// get from issue.body the car and track name: **Track name:** Test\n- **Car name:** Testcar\n

	const carName = issue.body.match(/Car name: (.*)/)[1].trim();
	const trackName = issue.body.match(/Track name: (.*)/)[1].trim();
	console.log(carName, trackName);
	const username = issue.user.login.trim();
	const approvedBy = context.sender.login.trim();
	const setupBlob = issue.body.match(/```ini([\s\S]*)```/)[1].trim();
	const setupFilePath = `./setups/${carName}/${trackName}/${username}.ini`;

	console.log(setupBlob);

	// process.env["CAR_NAME"] = carName;
	// process.env["TRACK_NAME"] = trackName;
	// process.env["USERNAME"] = username;
	// process.env["APPROVED_BY"] = approvedBy;

	fs.mkdirSync(`./setups/${carName}/${trackName}`, { recursive: true });
	fs.writeFileSync(setupFilePath, setupBlob);

	fs.writeFileSync(
		"./commit-message.txt",
		`Create setup for ${carName} at ${trackName} for ${username} approved by ${approvedBy}`,
	);
} else {
	console.log("Issue not closed or doesn't have the correct label or doesn't have the [SETUP] tag");
}
