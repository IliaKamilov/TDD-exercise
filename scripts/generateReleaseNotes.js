const { execSync } = require("child_process");
const fs = require("fs");

function getCommitsByType(from, to) {
  const format =
    '--format={"hash":"%h","subject":"%s","body":"%b","author":"%an"}';
  const command = `git log ${from}..${to} ${format}`;

  const output = execSync(command).toString();
  const commits = output
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  return commits.reduce((acc, commit) => {
    const type = commit.subject.split(":")[0];
    if (!acc[type]) acc[type] = [];
    acc[type].push(commit);
    return acc;
  }, {});
}

function generateReleaseNotes() {
  const tags = execSync("git tag -l --sort=-v:refname").toString().split("\n");
  const latestTag = tags[0];
  const commitsByType = getCommitsByType(latestTag, "HEAD");

  const sections = {
    feat: "🚀 New Features",
    fix: "🐛 Bug Fixes",
    perf: "⚡️ Performance Improvements",
    refactor: "♻️ Refactors",
    test: "✅ Tests",
    docs: "📚 Documentation",
    chore: "🔧 Chores",
  };

  let notes = "## What's Changed\n\n";

  Object.entries(sections).forEach(([type, title]) => {
    const commits = commitsByType[type];
    if (commits && commits.length > 0) {
      notes += `### ${title}\n\n`;
      commits.forEach((commit) => {
        const message = commit.subject.split(":")[1].trim();
        notes += `- ${message} (@${commit.author})\n`;
      });
      notes += "\n";
    }
  });

  // Add breaking changes section if any
  const breakingChanges = Object.values(commitsByType)
    .flat()
    .filter((commit) => commit.body.includes("BREAKING CHANGE"));

  if (breakingChanges.length > 0) {
    notes += "## ⚠️ Breaking Changes\n\n";
    breakingChanges.forEach((commit) => {
      const body = commit.body.split("BREAKING CHANGE:")[1].trim();
      notes += `- ${body}\n`;
    });
  }

  return notes;
}

console.log(generateReleaseNotes());
