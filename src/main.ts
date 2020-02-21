import * as core from "@actions/core"
import { GitHub } from "@actions/github"
import { Octokit } from "@octokit/rest"

type PullRequest = Octokit.PullsListResponseItem
type CheckRun = Octokit.ChecksListForRefResponseCheckRunsItem

const token = core.getInput("token")
const github = new GitHub(token)

const repoParams = {
  owner: "kingdaro",
  repo: "bookish-waffle",
}

const shouldMerge = async (pr: PullRequest) =>
  hasLabel(pr, "code review pass") &&
  hasLabel(pr, "qa pass") &&
  doesNotHaveLabel(pr, "wip") &&
  doesNotHaveLabel(pr, "do not merge") &&
  hasPassingChecks(pr)

const hasLabel = (pr: PullRequest, name: string) =>
  pr.labels.some((label) => label.name.toLowerCase() === name.toLowerCase())

const doesNotHaveLabel = (pr: PullRequest, name: string) =>
  pr.labels.every((label) => label.name.toLowerCase() !== name.toLowerCase())

const hasPassingChecks = async (pr: PullRequest) => {
  const { data: checks } = await github.checks.listForRef({
    ...repoParams,
    ref: pr.head.ref,
  })
  return checks.check_runs.every(isCheckRunPassing)
}

const isCheckRunPassing = (run: CheckRun) =>
  run.status === "completed" && run.conclusion === "success"

const prHumanFormat = (pr: PullRequest) => `#${pr.number} (${pr.title})`

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

const merge = (pr: PullRequest) =>
  github.pulls.merge({ ...repoParams, pull_number: pr.number })

async function run() {
  const result = await github.pulls.list(repoParams)

  const tasks = result.data.map(async (pr) => {
    try {
      if (await shouldMerge(pr)) {
        await merge(pr)
        core.info(`Merged #${pr.number} (${pr.title})`)
      }
    } catch (error) {
      // prettier-ignore
      const errorMessage = `Could not merge ${prHumanFormat(pr)}: ${getErrorMessage(error)}`
      core.warning(errorMessage)
    }
  })

  await Promise.all(tasks)
}

run().catch((error) => {
  core.setFailed(getErrorMessage(error))
})
