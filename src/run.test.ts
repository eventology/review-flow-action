import { run } from "./run"

let nextNumber = 0
const prWithLabels = (labels: string[]) => ({
  number: nextNumber++,
  title: "awesome changes",
  labels: labels.map((name) => ({ name })),
})

const mockMergablePr = prWithLabels(["code review pass", "qa pass"])

const pullRequests = [
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
]

const mockClient = {
  getPullRequest: (number: number) => ({ data: pullRequests[number] }),
  mergePullRequest: jest.fn(),
  getChecks: async () => ({ data: { check_runs: [] } }),
}

it("merges with the correct labels, does not merge with wip/DNM labels", async () => {
  for (const [number] of pullRequests.entries()) {
    await run({
      client: mockClient as any,
      context: { issue: { number } } as any,
      mergeLabels: ["code review pass", "qa pass"],
      noMergeLabels: ["wip", "do not merge"],
    })
  }
  expect(mockClient.mergePullRequest).toHaveBeenCalledTimes(1)
  expect(mockClient.mergePullRequest).toHaveBeenCalledWith(mockMergablePr)
})
