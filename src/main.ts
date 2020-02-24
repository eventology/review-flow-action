import * as core from "@actions/core"
import { getErrorMessage } from "./helpers"
import { run } from "./run"

run().catch((error) => {
  core.setFailed(getErrorMessage(error))
})
