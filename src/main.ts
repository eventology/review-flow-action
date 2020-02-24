import * as core from "@actions/core"
import {
  doesNotHaveLabel,
  getPullRequests,
  hasLabel,
  hasPassingChecks,
  mergePullRequest,
  prHumanFormat,
  PullRequest,
} from "./github"
import { getErrorMessage } from "./helpers"

const hasCorrectLabels = (pr: PullRequest) =>
  hasLabel(pr, "code review pass") &&
  hasLabel(pr, "qa pass") &&
  doesNotHaveLabel(pr, "wip") &&
  doesNotHaveLabel(pr, "do not merge")

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
