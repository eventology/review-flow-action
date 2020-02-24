import * as core from "@actions/core"
import { context, GitHub } from "@actions/github"
import { Octokit } from "@octokit/rest"

export type PullRequest = Octokit.PullsListResponseItem
export type CheckRun = Octokit.ChecksListForRefResponseCheckRunsItem

const token = core.getInput("token")
const github = new GitHub(token)

const repoParams = {
  owner: context.repo.owner,
  repo: context.repo.repo,
}

export const getChecks = (pr: PullRequest) =>
  github.checks.listForRef({
    ...repoParams,
    ref: pr.head.ref,
  })

export const getPullRequests = () => github.pulls.list(repoParams)

export const mergePullRequest = (pr: PullRequest) =>
  github.pulls.merge({ ...repoParams, pull_number: pr.number })
