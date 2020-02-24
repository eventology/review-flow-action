import { mergePullRequest } from "./github"
import { run } from "./run"

let nextNumber = 0
const prWithLabels = (labels: string[]) => ({
  number: nextNumber++,
  title: "awesome changes",
  labels: labels.map((name) => ({ name })),
})

const mockMergablePr = prWithLabels(["code review pass", "qa pass"])

jest.mock("./github", () => ({
  getPullRequests: async () => ({
    data: [
      prWithLabels([]),
      prWithLabels(["code review pass"]),
      prWithLabels(["qa pass"]),
      mockMergablePr,
      prWithLabels(["wip"]),
      prWithLabels(["wip", "code review pass"]),
      prWithLabels(["wip", "qa pass"]),
      prWithLabels(["wip", "code review pass", "qa pass"]),
      prWithLabels(["do not merge"]),
      prWithLabels(["do not merge", "code review pass"]),
      prWithLabels(["do not merge", "qa pass"]),
      prWithLabels(["do not merge", "code review pass", "qa pass"]),
      prWithLabels(["wip", "do not merge"]),
      prWithLabels(["wip", "do not merge", "code review pass"]),
      prWithLabels(["wip", "do not merge", "qa pass"]),
      prWithLabels(["wip", "do not merge", "code review pass", "qa pass"]),
    ],
  }),
  mergePullRequest: jest.fn(),
  getChecks: async () => ({ data: { check_runs: [] } }),
}))

it("merges with the correct labels, does not merge with wip/DNM labels", async () => {
  await run()
  expect(mergePullRequest).toHaveBeenCalledTimes(1)
  expect(mergePullRequest).toHaveBeenCalledWith(mockMergablePr)
})

it.todo("does not merge if status checks are failing")
