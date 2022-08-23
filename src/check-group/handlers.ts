/**
 * GitHub webhook event handlers
 * @module Handlers
 */

import {
  CheckGroup,
  extractPullRequestsFromCheckRunContext,
  fetchConfig,
  parsePullRequestNumberFromPullRequestContext
} from './core';
import {Context} from 'probot';
import {PullRequestData} from './types';
import {isTriggeredBySelf} from './core/trigger_filter';

export const pullRequestEventHandler = async (
  context: Context<'pull_request'>
): Promise<void> => {
  context.log.info('Pull request open/reopen event detected');
  const sha = process.env['GITHUB_SHA'];
  const config = await fetchConfig(context);
  const pullRequestNumber =
    parsePullRequestNumberFromPullRequestContext(context);
  const core = new CheckGroup(pullRequestNumber, config, context, sha);
  await core.run();
};

export const checkRunEventHandler = async (
  context: Context<'check_run'>
): Promise<void> => {
  const config = await fetchConfig(context);
  context.log.info(
    `Check run event detected with ID ${config.customServiceName}`
  );
  if (isTriggeredBySelf(context, config)) {
    return;
  }
  const pullRequests: PullRequestData[] =
    extractPullRequestsFromCheckRunContext(context);
  for (const pullRequest of pullRequests) {
    context.log.info(
      `Check pull request #${pullRequest.number} and sha ${pullRequest.sha}.`
    );
    const core = new CheckGroup(
      pullRequest.number,
      config,
      context,
      pullRequest.sha
    );
    await core.run();
  }
};
