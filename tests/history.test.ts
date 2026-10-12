import { describe, expect, it } from "vitest";
import {
  parseGithubUrl,
  getRawContentUrl,
  checkBashCommands,
  checkGitCommands,
} from "../utils";

const parsedUrl = await parseGithubUrl();
if (parsedUrl === null) {
  throw new Error("Unable to parse GitHub URL, please add it to repo.txt");
}
const history = await (
  await fetch(getRawContentUrl(parsedUrl.owner, parsedUrl.repo, "history.txt"))
).text();

describe("bash / zsh history test", () => {
  it("Check bash commands", async () => {
    expect(history).toBeDefined();
    const result = checkBashCommands(history);
    expect(result.missing).toEqual([]);
    expect(result.success).toBe(true);
  });
  it("Check git commands", async () => {
    expect(history).toBeDefined();
    const result = checkGitCommands(history);
    expect(result.missing).toEqual([]);
    expect(result.success).toBe(true);
  });
});
