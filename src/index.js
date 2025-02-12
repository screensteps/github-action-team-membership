import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { getTeams } from './teamChecker';

run();

async function run() {
    try {
        const environment = core.getInput('environment', {required: true}).toLocaleLowerCase();
        const restrictions = core.getInput('restrictions', {required: true}).split(',');
        const shouldExit = core.getInput('exit').toLocaleLowerCase() == 'true';
        const token = core.getInput('token') ? core.getInput('token') : process.env['GITHUB_TOKEN'];
        const username = context.actor;

        // if restrictions is empty string
        // if any restriction combinations do not contain ":"
        if (shouldExit && restrictions.some(restriction => !restriction.includes(':'))) {
            core.setFailed('Invalid restrictions');
        }

        // Retrieve teams
        const teams = await getTeams(token, username);
        core.setOutput('teams', teams);
        core.info(`User "${username}" is part of the teams: ${teams.join(',')}"`)

        // Execute workflow by default
        let teamPresent = true;

        let teamNameForErrorMessage;
        restrictions.forEach(restriction => {
            const [env, team] = restriction.split(':');
            if (env.toLocaleLowerCase() == environment) {
                teamPresent = teams.includes(team);
                core.setOutput('permitted', teamPresent);
                if (!teamPresent) {
                    teamNameForErrorMessage = team
                };
            }
        });

        if (core.getInput('comment') && core.getInput('issue-number') && !teamPresent) {
            const comment = core.getInput('comment');
            core.info(context)
            const issueNumber = core.getInput('issue-number')
            if (comment.length > 0 && issueNumber != 0) {
                const octokit = getOctokit(token);
                const { owner, repo } = context.repo;
                await octokit.rest.issues.createComment({
                    owner: owner,
                    repo: repo,
                    issue_number: issueNumber,
                    body: comment,
                });
            }
        }

        if (shouldExit && !teamPresent) {
            core.setFailed(`Not in team "${teamNameForErrorMessage}"`);
        }

    } catch (err) {
        core.setFailed(`Error while trying to establish team membership: ${err}`);
    }
}
