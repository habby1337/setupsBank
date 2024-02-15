const fs = require("fs");

const contextJson = fs.readFileSync("./context.json", "utf8");
const context = JSON.parse(contextJson);
const issue = context.issue;

const isClosed = issue.state === "closed";
const hasLabel = issue.labels.some((label) => label.name === "Awaiting Approval");
const hasSetupTag = issue.title.includes("[SETUP]");

if (isClosed && hasLabel && hasSetupTag) {
	const carName = issue.body.match(/Car name: (.*)/)[1].trim();
	const trackName = issue.body.match(/Track name: (.*)/)[1].trim();

	const username = issue.user.login.trim();
	const approvedBy = context.sender.login.trim();
	const setupBlob = issue.body.match(/```ini([\s\S]*)```/)[1].trim();
	const setupFilePath = `./setups/${carName}/${trackName}/${username}.ini`;

	fs.mkdirSync(`./setups/${carName}/`, { recursive: true });
	fs.mkdirSync(`./setups/${carName}/${trackName}/`, { recursive: true });
	fs.writeFileSync(setupFilePath, setupBlob);

	fs.writeFileSync(
		"./commit-message.txt",
		`Create setup for ${carName} at ${trackName} for ${username} approved by ${approvedBy}`,
	);
} else {
	console.log("Issue not closed or doesn't have the correct label or doesn't have the [SETUP] tag");
}
