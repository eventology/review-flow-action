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
  try {
    const { data: pr } = await client.getPullRequest(context.issue.number)

    const hasCorrectLabels = () =>
      mergeLabels.every((label) => hasLabel(pr, label)) &&
      noMergeLabels.every((label) => doesNotHaveLabel(pr, label))

    const hasPassingChecks = async () => {
      const { data: checks } = await client.getChecks(pr)
      return checks.check_runs.every(isCheckRunPassing)
    }

    if (hasCorrectLabels() && (await hasPassingChecks())) {
      await client.mergePullRequest(pr)
      core.info(`Merged #${pr.number} (${pr.title})`)
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
