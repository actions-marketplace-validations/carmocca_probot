import {Probot, Context} from 'probot';
import {PullRequestEvent} from '@octokit/webhooks-types';
import {CheckGroup, fetchConfig} from './core';

const eventHandler = async (context: Context): Promise<void> => {
  const sha = process.env['GITHUB_SHA'];
  const name = context.name;
  if (name !== 'pull_request') {
    throw new Error(`name ${name} not implemented`);
  }
  const payload = context.payload as PullRequestEvent;
  const pullRequestNumber = payload.pull_request.number;
  context.log.info(
    `${name} event detected for PR ${pullRequestNumber}, SHA ${sha}`
  );
  const config = await fetchConfig(context);
  const core = new CheckGroup(pullRequestNumber, config, context, sha);
  await core.run();
};

function checkGroupApp(app: Probot): void {
  app.on('pull_request', async context => await eventHandler(context));
}

export default checkGroupApp;
