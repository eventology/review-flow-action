import { context, GitHub } from "@actions/github"
import { Octokit } from "@octokit/rest"

export type GitHubClient = ReturnType<typeof createClient>
export type PullRequest = Octokit.PullsListResponseItem
export type CheckRun = Octokit.ChecksListForRefResponseCheckRunsItem

export function createClient(token: string) {
  const github = new GitHub(token)

  const repoParams = {
    owner: context.repo.owner,
    repo: context.repo.repo,
  }

  const getPullRequest = (pull_number: number) =>
    github.pulls.get({ ...repoParams, pull_number })

  const getChecks = (pr: PullRequest) =>
    github.checks.listForRef({
      ...repoParams,
      ref: pr.head.ref,
    })

  const mergePullRequest = (pr: PullRequest) =>
    github.pulls.merge({ ...repoParams, pull_number: pr.number })

  return { getChecks, getPullRequest, mergePullRequest }
}
