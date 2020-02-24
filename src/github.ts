import * as core from "@actions/core"
import { context, GitHub } from "@actions/github"
import { Octokit } from "@octokit/rest"

export type PullRequest = Octokit.PullsListResponseItem
type CheckRun = Octokit.ChecksListForRefResponseCheckRunsItem

const token = core.getInput("token")
const github = new GitHub(token)

const repoParams = {
  owner: context.repo.owner,
  repo: context.repo.repo,
}

export const hasLabel = (pr: PullRequest, name: string) =>
  pr.labels.some((label) => label.name.toLowerCase() === name.toLowerCase())

export const doesNotHaveLabel = (pr: PullRequest, name: string) =>
  pr.labels.every((label) => label.name.toLowerCase() !== name.toLowerCase())

export const hasPassingChecks = async (pr: PullRequest) => {
  const { data: checks } = await github.checks.listForRef({
    ...repoParams,
    ref: pr.head.ref,
  })
  return checks.check_runs.every(isCheckRunPassing)
}

const isCheckRunPassing = (run: CheckRun) =>
  run.status === "completed" && run.conclusion === "success"

export const getPullRequests = () => github.pulls.list(repoParams)

export const mergePullRequest = (pr: PullRequest) =>
  github.pulls.merge({ ...repoParams, pull_number: pr.number })

export const prHumanFormat = (pr: PullRequest) => `#${pr.number} (${pr.title})`
