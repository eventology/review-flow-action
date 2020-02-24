import * as core from "@actions/core"
import {
  CheckRun,
  getChecks,
  getPullRequests,
  mergePullRequest,
  PullRequest,
} from "./github"
import { getErrorMessage } from "./helpers"

const hasLabel = (pr: PullRequest, name: string) =>
  pr.labels.some((label) => label.name.toLowerCase() === name.toLowerCase())

const doesNotHaveLabel = (pr: PullRequest, name: string) =>
  pr.labels.every((label) => label.name.toLowerCase() !== name.toLowerCase())

const hasCorrectLabels = (pr: PullRequest) =>
  hasLabel(pr, "code review pass") &&
  hasLabel(pr, "qa pass") &&
  doesNotHaveLabel(pr, "wip") &&
  doesNotHaveLabel(pr, "do not merge")

const hasPassingChecks = async (pr: PullRequest) => {
  const { data: checks } = await getChecks(pr)
  return checks.check_runs.every(isCheckRunPassing)
}

const isCheckRunPassing = (run: CheckRun) =>
  run.status === "completed" && run.conclusion === "success"

export const prHumanFormat = (pr: PullRequest) => `#${pr.number} (${pr.title})`

async function run() {
  const result = await getPullRequests()

  const tasks = result.data.map(async (pr) => {
    try {
      if (hasCorrectLabels(pr) && (await hasPassingChecks(pr))) {
        await mergePullRequest(pr)
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
