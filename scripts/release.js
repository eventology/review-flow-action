// @ts-check
/* eslint-disable no-console */
const { exec, execSync } = require("child_process")
const inquirer = require("inquirer")
// @ts-ignore
const pkg = require("../package.json")
const { promises: fs } = require("fs")

async function main() {
  console.info(`Current version: ${pkg.version}`)

  const { newVersion } = await inquirer.prompt([
    { type: "input", name: "newVersion", message: "New version?" },
  ])

  // update package.json
  await fs.writeFile(
    `${__dirname}/../package.json`,
    JSON.stringify({ ...pkg, version: newVersion }, null, 2),
  )

  // build
  execSync("yarn build")

  // commit
  execSync(`git commit -a -m "v${newVersion}"`)

  // push to master
  execSync(`git push origin master`)

  // push to releases/{version}
  execSync(`git push origin master:releases/${newVersion}`)

  console.info("Success!")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
