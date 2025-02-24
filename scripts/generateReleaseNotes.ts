import { execSync } from "child_process";

interface Commit {
  hash: string;
  subject: string;
  body: string;
  author: string;
}

interface CommitsByType {
  [key: string]: Commit[];
}

interface Section {
  [key: string]: string;
}

const SECTIONS: Section = {
  feat: "🚀 New Features",
  fix: "🐞 Bug Fixes",
  perf: "⚡ Performance Improvements",
  refactor: "♻️ Refactors",
  test: "✅ Tests",
  docs: "📚 Documentation",
  chore: "🔧 Chores",
  style: "💅 Styling",
  ci: "👷 CI/CD",
  security: "🔒 Security",
};

function getCommitsByType(from: string, to: string): CommitsByType {
  const format =
    '--format={"hash":"%h","subject":"%s","body":"%b","author":"%an"}';
  const command = `git log ${from}..${to} ${format}`;

  try {
    const output = execSync(command).toString();
    const commits: Commit[] = output
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    return commits.reduce((acc: CommitsByType, commit: Commit) => {
      const [type] = commit.subject.split(":");
      if (!acc[type]) acc[type] = [];
      acc[type].push(commit);
      return acc;
    }, {});
  } catch (error) {
    console.error("Error getting commits:", error);
    return {};
  }
}

function getLatestTag(): string {
  try {
    const tags = execSync("git tag -l --sort=-v:refname")
      .toString()
      .split("\n");
    return tags[0] || "HEAD~1";
  } catch (error) {
    console.error("Error getting latest tag:", error);
    return "HEAD~1";
  }
}

function formatMessage(commit: Commit): string {
  const message = commit.subject.split(":")[1]?.trim() || commit.subject;
  const prMatch = commit.body.match(/#(\d+)/);
  const prNumber = prMatch ? prMatch[1] : null;

  return prNumber
    ? `- ${message} (#${prNumber}) (@${commit.author})`
    : `- ${message} (@${commit.author})`;
}

function generateReleaseNotes(): string {
  const latestTag = getLatestTag();
  const commitsByType = getCommitsByType(latestTag, "HEAD");

  let notes = `## What's Changed\n\n`;

  // Add summary section
  const totalCommits = Object.values(commitsByType).flat().length;
  notes += `> ${totalCommits} changes since ${latestTag}\n\n`;

  // Add sections
  Object.entries(SECTIONS).forEach(([type, title]) => {
    const commits = commitsByType[type];
    if (commits?.length > 0) {
      notes += `### ${title}\n\n`;
      commits.forEach((commit) => {
        notes += `${formatMessage(commit)}\n`;
      });
      notes += "\n";
    }
  });

  // Add breaking changes section
  const breakingChanges = Object.values(commitsByType)
    .flat()
    .filter((commit) => commit.body.includes("BREAKING CHANGE"));

  if (breakingChanges.length > 0) {
    notes += "## ⚠️ Breaking Changes\n\n";
    breakingChanges.forEach((commit) => {
      const [, ...breakingMessage] = commit.body.split("BREAKING CHANGE:");
      notes += `- ${breakingMessage.join("").trim()}\n`;
    });
    notes += "\n";
  }

  return notes;
}

// Execute if run directly
if (require.main === module) {
  console.log(generateReleaseNotes());
}

export { generateReleaseNotes, getCommitsByType, getLatestTag };
