/**
 * @module Core
 */

import {
  defaultCheckId,
  errorCheckDetails,
  errorCheckSummary,
  startCheckDetails,
  startCheckSummary,
} from "../config";
import {
  generateProgressDetails,
  generateProgressSummary,
} from "../utils";
import type { CheckGroupConfig } from "../types";
import type { Context } from "probot";
import { createStatus } from "./create_status";
import { fetchConfig } from "./config_getter";
import { matchFilenamesToSubprojects } from "../utils";
import { satisfyExpectedChecks } from "../utils";

/**
 * The orchestration class.
 */
export class CheckGroup {
  pullRequestNumber: number;
  config: CheckGroupConfig;
  context: Context;
  sha: string;

  constructor(
    pullRequestNumber: number,
    config: CheckGroupConfig,
    context: Context,
    sha: string,
  ) {
    this.pullRequestNumber = pullRequestNumber;
    this.config = config;
    this.context = context;
    this.sha = sha;
  }

  async run(): Promise<void> {
    try {
      const filenames = await this.files();
      this.context.log.info(`Files are: ${JSON.stringify(filenames)}`);
      const subprojs = matchFilenamesToSubprojects(
        filenames,
        this.config.subProjects,
      );
      this.context.log.info(
        `Matching subprojects are: ${JSON.stringify(subprojs)}`,
      );
      const postedChecks = await this.getPostedChecks(this.sha);
      this.context.log.info(
        `Posted checks are: ${JSON.stringify(postedChecks)}`,
      );
      const conclusion = satisfyExpectedChecks(subprojs, postedChecks);
      if (!(defaultCheckId in postedChecks)) {
        this.context.log.info("First time run. Post starting check.");
        await this.postStartingCheck(
          this.config.customServiceName,
          startCheckSummary,
          startCheckDetails,
        );
      }
      if (conclusion === "all_passing") {
        this.context.log.info("All expected checks passed.");
        await this.postPassingCheck(
          this.config.customServiceName,
          generateProgressSummary(subprojs, postedChecks),
          generateProgressDetails(subprojs, postedChecks, this.config),
        );
      } else if (conclusion === "has_failure") {
        this.context.log.info("Some of the expected checks failed.");
        await this.postFailingCheck(
          this.config.customServiceName,
          generateProgressSummary(subprojs, postedChecks),
          generateProgressDetails(subprojs, postedChecks, this.config),
        );
      } else {
        this.context.log.info("Expected checks are still pending.");
        await this.postUpdatingCheck(
          this.config.customServiceName,
          generateProgressSummary(subprojs, postedChecks),
          generateProgressDetails(subprojs, postedChecks, this.config),
        );
      }
    } catch {
      this.context.log.info("The app crashed.");
      // TODO(@tianhaoz95): Add a better error message. Consider using
      // markdown import suggested by
      // https://stackoverflow.com/questions/44678315/how-to-import-markdown-md-file-in-typescript
      await this.postFailingCheck(
        this.config.customServiceName,
        errorCheckSummary,
        errorCheckDetails,
      );
    }
  }

  /**
   * Fetches a list of already finished
   * checks.
   *
   * @param sha The sha of the commit to check
   */
  async getPostedChecks(sha: string): Promise<Record<string, string>> {
    this.context.log.info(`Fetch posted check runs for ${sha}`);
    const checkRuns = await this.context.octokit.paginate(
      this.context.octokit.checks.listForRef,
      this.context.repo({
        ref: sha,
      }),
      (response) => response.data,
    );
    const checkNames: Record<string, string> = {};
    checkRuns.forEach(
      (
        /* eslint-disable */
        checkRun: any,
        /* eslint-enable */
      ) => {
        const conclusion = checkRun.conclusion
          ? checkRun.conclusion
          : "pending";
        checkNames[checkRun.name] = conclusion;
      },
    );
    return checkNames;
  }

  /**
   * Gets a list of files that are modified in
   * a pull request.
   */
  async files(): Promise<string[]> {
    const pullRequestFiles = await this.context.octokit.paginate(
      this.context.octokit.pulls.listFiles,
      this.context.repo({
        "pull_number": this.pullRequestNumber,
      }),
      (response) => response.data,
    );
    const filenames: string[] = [];
    pullRequestFiles.forEach(
      (
        /* eslint-disable */
        pullRequestFile: any,
        /* eslint-enable */
      ) => {
        filenames.push(pullRequestFile.filename);
      },
    );
    return filenames;
  }

  /**
   * Post a starting check
   */
  async postStartingCheck(
    name: string,
    summary: string,
    details: string,
  ): Promise<void> {
    /* eslint-disable */
    await createStatus(
      undefined,
      "queued",
      name,
      summary,
      details,
    );
    /* eslint-enable */
  }

  async postUpdatingCheck(
    name: string,
    summary: string,
    details: string,
  ): Promise<void> {
    /* eslint-disable */
    await createStatus(
      undefined,
      "in_progress",
      name,
      summary,
      details,
    );
    /* eslint-enable */
  }

  async postPassingCheck(
    name: string,
    summary: string,
    details: string,
  ): Promise<void> {
    /* eslint-disable */
    await createStatus(
      "success",
      "completed",
      name,
      summary,
      details,
    );
    /* eslint-enable */
  }

  async postFailingCheck(
    name: string,
    summary: string,
    details: string,
  ): Promise<void> {
    /* eslint-disable */
    await createStatus(
      "failure",
      "completed",
      name,
      summary,
      details,
    );
    /* eslint-enable */
  }
}

export {fetchConfig};
