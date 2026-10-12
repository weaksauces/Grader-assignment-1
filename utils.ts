import fs from "node:fs";

// Given a url like this:
// https://github.com/CS61D/Assignment-Solution-Git
// or:
// https://github.com/CS61D/Assignment-Solution-Git.git
//
// Read from repo.txt
// Return the owner and repo name
export const parseGithubUrl = async (): Promise<{
  owner: string;
  repo: string;
} | null> => {
  try {
    const url = await fs.promises.readFile("repo.txt", "utf-8");

    let trimmedUrl = url.trim();

    // Allow URLs copied directly from GitHub's HTTPS clone button
    if (trimmedUrl.endsWith(".git")) {
      trimmedUrl = trimmedUrl.slice(0, -4);
    }

    // Allow a trailing slash
    if (trimmedUrl.endsWith("/")) {
      trimmedUrl = trimmedUrl.slice(0, -1);
    }

    const match = trimmedUrl.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/,
    );

    if (match) {
      const [, owner, repo] = match;
      return { owner, repo };
    }

    throw new Error("Invalid GitHub URL format.");
  } catch (error) {
    return null;
  }
};

export const getRawContentUrl = (
  owner: string,
  repo: string,
  path: string,
) => `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;

type MarkdownCheckResult = {
  hasH1Header: boolean;
  hasItalics: boolean;
  hasBold: boolean;
  hasImage: boolean;
  hasCodeBlock: boolean;
  hasLink: boolean;
};

export function checkMarkdownCharacteristics(
  markdown: string,
): MarkdownCheckResult {
  return {
    hasH1Header: /^#\s.+/m.test(markdown),
    hasItalics: /(\*|_).+?\1/.test(markdown),
    hasBold: /(\*\*|__).+?\1/.test(markdown),
    hasImage: /!\[.*?\]\(.*?\)/.test(markdown),
    hasCodeBlock: /```[\s\S]*?```/.test(markdown),
    hasLink: /\[.*?\]\(.*?\)/.test(markdown),
  };
}

type CommandCheckResult = {
  success: boolean;
  missing: string[];
};

/**
 * Parses the bash history and returns an array of commands used.
 * @param history The bash history as a string.
 */
function parseBashHistory(history: string): string[] {
  return history
    .split("\n")
    .map((line) => line.trim().replace(/^\d+\s+/, ""))
    .filter((line) => line.length > 0);
}

/**
 * Checks the required bash commands in the history.
 * @param history The bash history as a string.
 */
export function checkBashCommands(history: string): CommandCheckResult {
  const requiredCommands = ["ls", "echo", "cd", "pwd", "mkdir", "touch"];
  const eitherCommands = ["mv", "rm"];

  const commandsUsed = parseBashHistory(history);

  const missingCommands = requiredCommands.filter(
    (cmd) => !commandsUsed.some((line) => line.startsWith(cmd)),
  );

  const eitherCommandUsed = eitherCommands.some((cmd) =>
    commandsUsed.some((line) => line.startsWith(cmd)),
  );

  if (!eitherCommandUsed) {
    missingCommands.push(`One of: ${eitherCommands.join(", ")}`);
  }

  return {
    success: missingCommands.length === 0,
    missing: missingCommands,
  };
}

/**
 * Checks the required git commands in the history.
 * @param history The bash history as a string.
 */
export function checkGitCommands(history: string): CommandCheckResult {
  const requiredGitCommands = [
    "git init",
    "git status",
    "git add",
    "git commit",
    "git branch",
    "git merge",
    "git push",
    "git pull",
  ];

  const commandsUsed = parseBashHistory(history);

  // Check required Git commands
  const missingGitCommands = requiredGitCommands.filter(
    (cmd) => !commandsUsed.some((line) => line.startsWith(cmd)),
  );

  // Accept either git checkout or git switch
  const branchSwitchUsed = commandsUsed.some(
    (line) =>
      line.startsWith("git checkout") || line.startsWith("git switch"),
  );

  if (!branchSwitchUsed) {
    missingGitCommands.push("One of: git checkout, git switch");
  }

  // Accept any standard way of deleting a branch
  const deleteBranchCommands = [
    /git branch -D \S+/,
    /git branch -d \S+/,
    /git branch --delete \S+/,
  ];

  const branchDeletionUsed = deleteBranchCommands.some((pattern) =>
    commandsUsed.some((line) => pattern.test(line)),
  );

  if (!branchDeletionUsed) {
    missingGitCommands.push(
      "git branch -D <branch>, git branch -d <branch>, or git branch --delete <branch>",
    );
  }

  return {
    success: missingGitCommands.length === 0,
    missing: missingGitCommands,
  };
}