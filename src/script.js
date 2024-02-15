const fs = require("fs");
const path = require("path");

const contextJson = fs.readFileSync("./context.json", "utf8");
const context = JSON.parse(contextJson);
const issue = context.issue;
console.log(issue);
const isClosed = issue.state === "closed";
console.log(issue.labels);
// const hasLabel = issue.labels.map((label) => label.name).includes("Awaiting Approval");
const hasLabel = issue.labels.some((label) => label.name === "Awaiting Approval");
const hasSetupTag = issue.title.includes("[SETUP]");

if (isClosed && hasLabel && hasSetupTag) {
	// get from issue.body the car and track name: **Track name:** Test\n- **Car name:** Testcar\n

	const carName = issue.body.match(/\*\*Car name:\*\* (.*)/)[1].trim();
	const trackName = issue.body.match(/\*\*Track name:\*\* (.*)/)[1].trim();
	console.log(carName, trackName);
	const username = issue.user.login.trim();
	const approvedBy = context.sender.login.trim();
	const setupFilePath = `./setups/${carName}/${trackName}/${username}.ini`;
	const dirPath = path.dirname(setupFilePath);

	if (!fs.existsSync(dirPath)) {
		console.log(
			`Creating setup file for ${carName} at ${trackName} from ${username} approved by ${approvedBy} dirpath: ${dirPath}, path: ${setupFilePath}, ${process.cwd()}`,
		);
		try {
			fs.mkdirSync(dirPath, {
				recursive: true,
			});
		} catch (err) {
			console.error(err);
		}

		try {
			fs.writeFileSync(setupFilePath, "Hello test");
		} catch (err) {
			console.error(err);
		}
		// fs.writeFileSync(setupFilePath, "");
	} else {
		console.log(`Setup file for ${carName} at ${trackName} from ${username} already exists`);
	}
}
