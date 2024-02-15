const github = require("@actions/github");
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
	const setupBlob = issue.body.match(/```ini\n([\s\S]+)```/)[1].trim();
	const setupFilePath = `./setups/${carName}/${trackName}/${username}.ini`;

	const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
	const commitMessage = `Create setup file for ${carName} at ${trackName} from ${username} approved by ${approvedBy}`;
	const commitContent = Buffer.from(setupBlob).toString("base64");

	octokit.repos
		.createOrUpdateFile({
			owner: github.context.repo.owner,
			repo: github.context.repo.repo,
			path: setupFilePath,
			message: commitMessage,
			content: Buffer.from(commitContent).toString("base64"),
			branch: github.context.ref.replace("refs/heads/", ""),
		})
		.then((resopnse) => {
			console.log("Commit created: ", response.data.commit.sha);
		})
		.catch((error) => {
			console.error("Error creating commit: ", error);
		});
}
