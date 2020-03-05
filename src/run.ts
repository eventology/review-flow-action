import * as core from "@actions/core"
import { Context as GitHubContext } from "@actions/github/lib/context"
import { CheckRun, GitHubClient, PullRequest } from "./github"
import { getErrorMessage } from "./helpers"

type RunOptions = {
  client: GitHubClient
  context: GitHubContext
  mergeLabels: string[]
  noMergeLabels: string[]
}

export async function run({
  client,
  context,
  mergeLabels,
  noMergeLabels,
}: RunOptions) {
  core.info(`Checking for merge labels:`)

  try {
    const { data: pr } = await client.getPullRequest(context.issue.number)
    const { data: checks } = await client.getChecks(pr)

    const hasMergeLabels = mergeLabels.every((label) => hasLabel(pr, label))

    const doesNotHaveNoMergeLabels = noMergeLabels.every((label) =>
      doesNotHaveLabel(pr, label),
    )

    const hasPassingChecks = checks.check_runs.every(isCheckRunPassing)

    core.info(`Has merge labels: ${hasMergeLabels}`)
    core.info(`Does not have no merge labels: ${doesNotHaveNoMergeLabels}`)
    core.info(`Has passing checks: ${hasPassingChecks}`)

    if (hasMergeLabels && doesNotHaveNoMergeLabels && hasPassingChecks) {
      await client.mergePullRequest(pr)
      core.info(`Merged #${pr.number} (${pr.title})`)
    } else {
      core.info("Conditions did not pass, could not merge")
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    core.warning(`Could not merge #${context.issue.number}: ${errorMessage}`)
  }
}

const hasLabel = (pr: PullRequest, name: string) =>
  pr.labels.some((label) => label.name.toLowerCase() === name.toLowerCase())

const doesNotHaveLabel = (pr: PullRequest, name: string) =>
  pr.labels.every((label) => label.name.toLowerCase() !== name.toLowerCase())

const isCheckRunPassing = (run: CheckRun) =>
  run.status === "completed" && run.conclusion === "success"
