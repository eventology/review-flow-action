import * as core from "@actions/core"
import { createClient } from "./github"
import { getErrorMessage } from "./helpers"
import { run } from "./run"

run(createClient(core.getInput("token"))).catch((error) => {
  core.setFailed(getErrorMessage(error))
})
