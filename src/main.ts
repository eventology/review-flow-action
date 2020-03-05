import * as core from "@actions/core"
import { context } from "@actions/github"
import { createClient } from "./github"
import { getErrorMessage } from "./helpers"
import { run } from "./run"

const getRequiredInput = (name: string) =>
  core.getInput(name, { required: true })

run({
  client: createClient(getRequiredInput("token")),
  context,
  mergeLabels: getRequiredInput("merge_labels").split(/\s*,\s*/),
  noMergeLabels: getRequiredInput("no_merge_labels").split(/\s*,\s*/),
}).catch((error) => core.setFailed(getErrorMessage(error)))
