import * as core from "@actions/core"
import { CheckRun, GitHubClient, PullRequest } from "./github"
import { getErrorMessage } from "./helpers"

type RunOptions = {
  client: GitHubClient
  mergeLabels: string[]
  noMergeLabels: string[]
}

export async function run({ client, mergeLabels, noMergeLabels }: RunOptions) {
  const result = await client.getPullRequests()

  const hasCorrectLabels = (pr: PullRequest) =>
    mergeLabels.every((label) => hasLabel(pr, label)) &&
    noMergeLabels.every((label) => doesNotHaveLabel(pr, label))

  const hasPassingChecks = async (pr: PullRequest) => {
    const { data: checks } = await client.getChecks(pr)
    return checks.check_runs.every(isCheckRunPassing)
  }

  const tasks = result.data.map(async (pr) => {
    try {
      if (hasCorrectLabels(pr) && (await hasPassingChecks(pr))) {
        await client.mergePullRequest(pr)
        core.info(`Merged #${pr.number} (${pr.title})`)
      }
    } catch (error) {
      // prettier-ignore
      const errorMessage = `Could not merge ${prHumanFormat(pr)}: ${getErrorMessage(error)}`;
      core.warning(errorMessage)
    }
  })

  await Promise.all(tasks)
}

const hasLabel = (pr: PullRequest, name: string) =>
  pr.labels.some((label) => label.name.toLowerCase() === name.toLowerCase())

const doesNotHaveLabel = (pr: PullRequest, name: string) =>
  pr.labels.every((label) => label.name.toLowerCase() !== name.toLowerCase())

const isCheckRunPassing = (run: CheckRun) =>
  run.status === "completed" && run.conclusion === "success"

const prHumanFormat = (pr: PullRequest) => `#${pr.number} (${pr.title})`
