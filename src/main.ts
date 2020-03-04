import * as core from "@actions/core"
import { createClient } from "./github"
import { flattenToArray, getErrorMessage } from "./helpers"
import { run } from "./run"

const getRequiredInput = (name: string) =>
  core.getInput(name, { required: true })

run({
  client: createClient(getRequiredInput("token")),
  mergeLabels: flattenToArray(getRequiredInput("mergeLabels")),
  noMergeLabels: flattenToArray(getRequiredInput("noMergeLabels")),
}).catch((error) => core.setFailed(getErrorMessage(error)))
