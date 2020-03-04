import * as core from "@actions/core"
import { CheckRun, GitHubClient, PullRequest } from "./github"
import { getErrorMessage } from "./helpers"

export async function run(client: GitHubClient) {
  const result = await client.getPullRequests()

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

const hasCorrectLabels = (pr: PullRequest) =>
  hasLabel(pr, "code review pass") &&
  hasLabel(pr, "qa pass") &&
  doesNotHaveLabel(pr, "wip") &&
  doesNotHaveLabel(pr, "do not merge")

const isCheckRunPassing = (run: CheckRun) =>
  run.status === "completed" && run.conclusion === "success"

const prHumanFormat = (pr: PullRequest) => `#${pr.number} (${pr.title})`
