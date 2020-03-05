import * as core from "@actions/core"
import { context } from "@actions/github"
import { createClient } from "./github"
import { flattenToArray, getErrorMessage } from "./helpers"
import { run } from "./run"

const getRequiredInput = (name: string) =>
  core.getInput(name, { required: true })

run({
  client: createClient(getRequiredInput("token")),
  context,
  mergeLabels: flattenToArray(getRequiredInput("merge_labels")),
  noMergeLabels: flattenToArray(getRequiredInput("no_merge_labels")),
}).catch((error) => core.setFailed(getErrorMessage(error)))
