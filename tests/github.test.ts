import { describe, expect, it } from "vitest";
import { parseGithubUrl } from "../utils";
import { Octokit } from "octokit";
const octokit = new Octokit();

describe("GitHub tests", () => {
  it("Ensure two closed pull requests", async () => {
    const parsedUrl = await parseGithubUrl();
    if (parsedUrl === null) {
      throw new Error("Unable to parse GitHub URL, please add it to repo.txt");
    }
    const { data } = await octokit.rest.pulls.list({
      owner: parsedUrl.owner,
      repo: parsedUrl.repo,
      state: "closed",
    });

    expect(data.length).toBeGreaterThanOrEqual(2);
  });
});
