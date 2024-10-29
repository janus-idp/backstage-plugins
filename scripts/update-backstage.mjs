import glob from 'glob'
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import semver from 'semver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT_DIR = join(__dirname, '..')
const PLUGINS_DIR = join(ROOT_DIR, 'plugins')
const BACKSTAGE_JSON_PATH = join(ROOT_DIR, 'backstage.json')
const PACKAGE_JSON_GLOB = '**/package.json'
const IGNORE_GLOB = ['**/node_modules/**']
const BACKSTAGE_RELEASES_API = 'https://api.github.com/repos/backstage/backstage/releases'

// Change directory to the root of the project
process.chdir(ROOT_DIR)

/**
 * Pins dependencies in package.json files by removing the caret (^) from version ranges.
 */
function pinDependencies() {
  const packageJsonFiles = glob.sync(PACKAGE_JSON_GLOB, {
    ignore: IGNORE_GLOB
  })

  for (const packageJsonFile of packageJsonFiles) {
    try {
      const packageJsonPath = join(process.cwd(), packageJsonFile)
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      // Replace all instances of "^" with "" in package.json dependencies
      for (const depType of ['devDependencies']) {
        if (packageJson[depType]) {
          for (const depName in packageJson[depType]) {
            packageJson[depType][depName] = packageJson[depType][depName].replace(/^\^/, '')
          }
        }
      }
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8')
    } catch (error) {
      console.error(`Error processing ${packageJsonFile}:`, error)
    }
  }
}

/**
 * Fetches the latest Backstage version from the GitHub API.
 *
 * @returns {Promise<string>} The latest Backstage version.
 */
async function getLatestBackstageVersion() {
  try {
    const res = await fetch(BACKSTAGE_RELEASES_API)
    const data = await res.json()
    const versions = data
      .map((release) => release.tag_name)
      .filter((version) => semver.valid(version) && !semver.prerelease(version))
    return semver.maxSatisfying(versions, '*').substring(1)
  } catch (error) {
    console.error('Error fetching latest Backstage version:', error)
    throw error
  }
}

/**
 * Updates the Backstage version in the backstage.json file.
 *
 * @param {string} version - The new Backstage version.
 */
function updateBackstageVersionFile(version) {
  try {
    const data = { version }
    writeFileSync(BACKSTAGE_JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8')
  } catch (error) {
    console.error('Error updating Backstage version file:', error)
  }
}

/**
 * Updates the `backstage.supported-versions` field in package.json files under the `PLUGINS_DIR`.
 *
 * @param {string} backstageVersion - The Backstage version to set.
 */
function updateSupportedBackstageVersions(backstageVersion) {
  const packageJsonFiles = glob.sync(PACKAGE_JSON_GLOB, {
    cwd: PLUGINS_DIR, // Search only within PLUGINS_DIR
    ignore: IGNORE_GLOB
  })

  for (const packageJsonFile of packageJsonFiles) {
    try {
      const packageJsonPath = join(PLUGINS_DIR, packageJsonFile)
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

      // Update backstage.supported-versions
      packageJson['backstage'] = {
        ...packageJson['backstage'],
        'supported-versions': backstageVersion
      }

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8')
    } catch (error) {
      console.error(`Error processing ${packageJsonFile}:`, error)
    }
  }
}

/**
 * Parses command line arguments and returns an object with flag values.
 *
 * @returns {{ hasReleaseFlag: boolean, hasPatternFlag: boolean, releaseVersion: string, pattern: string }}
 */
function parseArguments() {
  const args = process.argv.slice(2)
  const releaseIndex = args.indexOf('--release')
  const patternIndex = args.indexOf('--pattern')
  const hasReleaseFlag = releaseIndex !== -1
  const hasPatternFlag = patternIndex !== -1

  // Ensure that --pattern and --release are not used together
  if (hasReleaseFlag && hasPatternFlag) {
    console.error('Error: The --pattern and --release flags cannot be used together.')
    process.exit(1)
  }

  let releaseVersion = ''
  let pattern = ''
  if (hasReleaseFlag) {
    releaseVersion = args[releaseIndex + 1]
    if (!releaseVersion) {
      console.error(
        `Error: The '--release' flag requires a version argument to bump to a specific Backstage release line or version (default: "main").`
      )
      process.exit(1)
    }
  } else if (hasPatternFlag) {
    pattern = args[patternIndex + 1]
    if (!pattern) {
      console.error(
        "Error: The '--pattern' flag requires a glob pattern to specify which packages to upgrade."
      )
      process.exit(1)
    }
  }

  return {
    hasReleaseFlag,
    hasPatternFlag,
    releaseVersion,
    pattern
  }
}

/**
 * Constructs the bump command based on the provided flags.
 *
 * @param {boolean} hasReleaseFlag
 * @param {boolean} hasPatternFlag
 * @param {string} releaseVersion
 * @param {string} pattern
 * @returns {string}
 */
function constructBumpCommand(hasReleaseFlag, hasPatternFlag, releaseVersion, pattern) {
  let bumpCommand = 'backstage-cli versions:bump --skip-install'
  if (hasReleaseFlag) {
    bumpCommand += ` --release ${releaseVersion}`
  } else if (hasPatternFlag) {
    bumpCommand += ` --pattern ${pattern}`
  }
  return bumpCommand
}

/**
 * Determines the Backstage version to use based on flags and pattern.
 *
 * @param {boolean} hasReleaseFlag
 * @param {boolean} hasPatternFlag
 * @param {string} releaseVersion
 * @param {string} pattern
 * @returns {Promise<string>}
 */
async function determineBackstageVersion(hasReleaseFlag, hasPatternFlag, releaseVersion, pattern) {
  if (hasReleaseFlag) {
    return releaseVersion
  }

  // implies that we are updating to the latest backstage version
  if (!hasPatternFlag) {
    return await getLatestBackstageVersion()
  }

  // implies that we are updating to the latest backstage version because `backstage` is include in the pattern
  if (hasPatternFlag && /backstage[^-]/.test(pattern)) {
    return await getLatestBackstageVersion()
  }

  // fetch the version from `backstage.json`
  try {
    const backstageJson = JSON.parse(readFileSync(BACKSTAGE_JSON_PATH, 'utf8'))
    return backstageJson.version
  } catch (error) {
    console.error('Error reading Backstage version:', error)
    process.exit(1)
  }
}

/**
 * The main function that orchestrates the update process.
 */
async function main() {
  try {
    const { hasReleaseFlag, hasPatternFlag, releaseVersion, pattern } = parseArguments()

    const bumpCommand = constructBumpCommand(
      hasReleaseFlag,
      hasPatternFlag,
      releaseVersion,
      pattern
    )

    console.log('Bumping version...')
    execSync(bumpCommand, { stdio: 'inherit' })

    console.log('Pinning all dependencies...')
    pinDependencies()

    const backstageVersion = await determineBackstageVersion(
      hasReleaseFlag,
      hasPatternFlag,
      releaseVersion,
      pattern
    )

    console.log(`Updating plugins supported versions to ${backstageVersion}...`)
    updateSupportedBackstageVersions(backstageVersion)

    console.log('Updating lockfile...')
    execSync('yarn install --no-immutable', { stdio: 'inherit' })

    console.log('Deduping lockfile...')
    execSync('yarn dedupe', { stdio: 'inherit' })

    console.log(`Updating backstage.json to ${backstageVersion}...`)
    updateBackstageVersionFile(backstageVersion)

    console.log(`Successfully updated the Backstage Showcase to ${backstageVersion}!`)
  } catch (error) {
    console.error('An error occurred during the update process:', error)
    process.exit(1)
  }
}

await main()
