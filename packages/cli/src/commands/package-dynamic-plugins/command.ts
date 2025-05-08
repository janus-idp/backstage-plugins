import { PackageRoles } from '@backstage/cli-node';

import chalk from 'chalk';
import { OptionValues } from 'commander';
import fs from 'fs-extra';
import { PackageJson } from 'type-fest';
import YAML from 'yaml';

import os from 'os';
import path from 'path';

import { paths } from '../../lib/paths';
import { Task } from '../../lib/tasks';

export async function command(opts: OptionValues): Promise<void> {
  const {
    exportTo,
    forceExport,
    preserveTempDir,
    tag,
    useDocker,
    containerTool = 'podman',
    platform,
  } = opts;
  if (!exportTo && !tag) {
    Task.error(
      `Neither ${chalk.white('--export-to')} or ${chalk.white('--tag')} was specified, either specify ${chalk.white('--export-to')} to export plugins to a directory or ${chalk.white('--tag')} to export plugins to a container image`,
    );
    return;
  }

  // check if the container tool is available, skip if just exporting the plugins to a directory
  let containerToolCmd = containerTool;

  if (!exportTo) {
    let _containerTool = containerTool;

    // Check if useDocker is set to true and set the container tool to docker
    if (useDocker) {
      Task.log(
        `The ${chalk.white('--use-docker')} flag is deprecated, use ${chalk.white(
          '--container-tool',
        )} instead`,
      );
      Task.log(
        `Setting ${chalk.white('--container-tool')} to docker as ${chalk.white(
          '--use-docker',
        )} was specified`,
      );
      _containerTool = 'docker';
    }

    // Validate containerTool value
    const allowedTools = ['docker', 'podman', 'buildah'];
    if (!allowedTools.includes(_containerTool)) {
      Task.error(
        `Invalid value for --container-tool: ${_containerTool}. Allowed values are: ${allowedTools.join(', ')}`,
      );
      return;
    }

    // version check command
    containerToolCmd = _containerTool;
    try {
      await Task.forCommand(`${containerToolCmd} --version`);
    } catch (e) {
      Task.error(
        `Unable to find ${containerToolCmd} command: ${e}\nMake sure that ${containerToolCmd} is installed and available in your PATH.`,
      );
      return;
    }
  }
  const workspacePackage = (await fs.readJson(
    paths.resolveTarget('package.json'),
  )) as PackageJson;
  const workspacePackageRole =
    PackageRoles.getRoleFromPackage(workspacePackage);
  const workspacePackageRoleInfo =
    workspacePackageRole !== undefined
      ? PackageRoles.getRoleInfo(workspacePackageRole)
      : undefined;
  const isMonoRepo = typeof workspacePackage.workspaces !== 'undefined';
  // Find all plugin packages in the workspace
  const packages = isMonoRepo
    ? await discoverPluginPackages()
    : [
        {
          packageDirectory: '.',
          packageFilePath: 'package.json',
          packageJson: workspacePackage,
          packageRole: workspacePackageRole,
          packageRoleInfo: workspacePackageRoleInfo,
        },
      ];
  // run export-dynamic on each plugin package
  for (const pluginPkg of packages) {
    const { packageDirectory, packageFilePath, packageJson } = pluginPkg;
    if (
      !fs.existsSync(path.join(packageDirectory, 'dist-dynamic')) ||
      forceExport
    ) {
      if (
        Object.keys(packageJson.scripts as { [key: string]: string }).find(
          script => script === 'export-dynamic',
        )
      ) {
        Task.log(
          `Running existing export-dynamic script on plugin package ${packageFilePath}`,
        );
        try {
          await Task.forCommand(`yarn export-dynamic`, {
            cwd: packageDirectory,
          });
        } catch (err) {
          Task.log(
            `Encountered an error running 'yarn export-dynamic' on plugin package ${packageFilePath}, this plugin will not be packaged.  The error was ${err}`,
          );
        }
      } else {
        Task.log(
          `Using generated command to export plugin package ${packageFilePath}`,
        );
        try {
          await Task.forCommand(
            `${process.execPath} ${process.argv[1]} package export-dynamic-plugin`,
            { cwd: packageDirectory },
          );
        } catch (err) {
          Task.log(
            `Encountered an error running 'npx @janus-idp/cli' on plugin package ${packageFilePath}, this plugin will not be packaged.  The error was ${err}`,
          );
        }
      }
    } else {
      Task.log(
        `Using existing 'dist-dynamic' directory at ${packageDirectory}`,
      );
    }
  }
  // create temporary directory to hold staged plugins for packaging
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'package-dynamic-plugins'),
  );
  const pluginRegistryMetadata = [];
  const pluginConfigs: Record<string, string> = {};
  try {
    // copy the dist-dynamic output folder for each plugin to some temp directory and generate the metadata entry for each plugin
    for (const pluginPkg of packages) {
      const { packageDirectory, packageFilePath } = pluginPkg;
      const distDynamicDirectory = path.join(packageDirectory, 'dist-dynamic');
      const pluginPackageJson = (await fs.readJson(
        path.join(distDynamicDirectory, 'package.json'),
      )) as PackageJson;
      const packageName = pluginPackageJson
        .name!.replace(/-dynamic$/, '')
        .replace(/^@/, '')
        .replace(/\//, '-');
      const targetDirectory = path.join(tmpDir, packageName);
      Task.log(`Copying '${distDynamicDirectory}' to '${targetDirectory}`);
      try {
        // Copy the exported package to the staging area and ensure symlinks
        // are copied as normal folders
        fs.cpSync(distDynamicDirectory, targetDirectory, {
          recursive: true,
          dereference: true,
        });
        const {
          name,
          version,
          description,
          backstage,
          homepage,
          repository,
          license,
          maintainers,
          author,
          bugs,
          keywords,
        } = pluginPackageJson;
        pluginRegistryMetadata.push({
          [packageName]: {
            name,
            version,
            description,
            backstage,
            homepage,
            repository,
            license,
            maintainers,
            author,
            bugs,
            keywords,
          },
        });
        // some plugins include configuration snippets in an app-config.janus-idp.yaml
        const pluginConfigPath =
          discoverPluginConfigurationFile(packageDirectory);
        if (typeof pluginConfigPath !== 'undefined') {
          try {
            const pluginConfig = fs.readFileSync(pluginConfigPath);
            pluginConfigs[packageName] = YAML.parse(
              pluginConfig.toLocaleString(),
            );
          } catch (err) {
            Task.log(
              `Encountered an error parsing configuration at ${pluginConfigPath}, no example configuration will be displayed. The error was ${err}`,
            );
          }
        }
      } catch (err) {
        Task.log(
          `Encountered an error copying static assets for plugin ${packageFilePath}, the plugin will not be packaged. The error was ${err}`,
        );
      }
    }

    // Write the plugin registry metadata
    const metadataFile = path.join(tmpDir, 'index.json');
    Task.log(`Writing plugin registry metadata to '${metadataFile}'`);
    await fs.writeFile(
      metadataFile,
      JSON.stringify(pluginRegistryMetadata, undefined, 2),
    );
    if (exportTo) {
      // copy the temporary directory contents to the target directory
      fs.mkdirSync(exportTo, { recursive: true });
      Task.log(`Writing exported plugins to ${exportTo}`);
      fs.readdirSync(tmpDir).forEach(entry => {
        const source = path.join(tmpDir, entry);
        const destination = path.join(exportTo, entry);
        fs.copySync(source, destination, { recursive: true, overwrite: true });
      });
    } else {
      // collect flags for the container build command
      const flags = [
        `--annotation io.backstage.dynamic-packages='${Buffer.from(JSON.stringify(pluginRegistryMetadata)).toString('base64')}'`,
      ];
      if (platform) {
        flags.push(`--platform ${platform}`);
      }
      // run the command to generate the image
      Task.log(`Creating image using ${containerToolCmd}`);
      const containerInput = `from scratch
COPY . .
`;
      const buildCmd = `echo "${containerInput}" | ${containerToolCmd} build ${flags.join(' ')} -t '${tag}' -f - .`;

      await Task.forCommand(buildCmd, { cwd: tmpDir });
      Task.log(`Successfully built image ${tag} with following plugins:`);
      for (const plugin of pluginRegistryMetadata) {
        Task.log(`  ${chalk.white(Object.keys(plugin)[0])}`);
      }
    }
    // print out a configuration example based on available plugin data
    try {
      const configurationExample = YAML.stringify({
        plugins: pluginRegistryMetadata.map(plugin => {
          const packageName = Object.keys(plugin)[0];
          const pluginConfig = pluginConfigs[packageName];
          const packageString = exportTo
            ? `./local-plugins/${packageName}`
            : `oci://${tag}!${packageName}`;
          return {
            package: packageString,
            disabled: false,
            ...(pluginConfig ? { pluginConfig } : {}),
          };
        }),
      });
      Task.log(
        `\nHere is an example dynamic-plugins.yaml for these plugins: \n\n${chalk.white(configurationExample)}\n\n`,
      );
    } catch (err) {
      Task.error(
        `An error occurred while creating configuration example: ${err}`,
      );
    }
  } catch (e) {
    Task.error(`Error encountered while packaging dynamic plugins: ${e}`);
  } finally {
    try {
      if (tmpDir && !preserveTempDir) {
        fs.rmSync(tmpDir, { recursive: true });
      }
      if (preserveTempDir) {
        Task.log(`Keeping temporary directory ${tmpDir}`);
      }
    } catch (err) {
      Task.error(
        `An error occurred while removing the temporary staging directory: ${err}`,
      );
    }
  }
  return;
}

/**
 * Scan the monorepo "plugins" directory and find all plugins that are eligible
 * to be exported as dynamic plugins
 * @returns
 */
async function discoverPluginPackages() {
  const packageJsonFilePaths = [];
  for (const file of discoverFiles(
    'plugins',
    ['package.json'],
    ['node_modules', 'dist-dynamic'],
  )) {
    packageJsonFilePaths.push(file);
  }
  return (
    await Promise.all(
      packageJsonFilePaths.map(async packageFilePath => {
        const packageJson = (await fs.readJson(packageFilePath)) as PackageJson;
        const packageRole = PackageRoles.getRoleFromPackage(packageJson);
        const packageRoleInfo = PackageRoles.getRoleInfo(packageRole ?? '');
        const packageDirectory = path.dirname(packageFilePath);
        return {
          packageDirectory,
          packageFilePath,
          packageJson,
          packageRole,
          packageRoleInfo,
        };
      }),
    )
  ).filter(pkg => {
    const { packageFilePath, packageRole } = pkg;
    switch (packageRole) {
      case 'frontend-plugin':
      case 'frontend-plugin-module':
      case 'backend-plugin':
      case 'backend-plugin-module':
        return true;
      default:
        Task.log(
          `Skipping package '${packageFilePath}' with unknown 'backstage.role': '${packageRole}'`,
        );
        return false;
    }
  });
}

/**
 * Scans the specified directory for plugin configuration files that
 * match known potential file names.
 * @param directory
 * @returns
 */
function discoverPluginConfigurationFile(
  directory: string,
): string | undefined {
  // Possible file names, the first match will be used
  const supportedFilenames = [
    'app-config.janus-idp.yaml',
    'app-config.backstage-community.yaml',
    'app-config.yaml',
  ];
  return supportedFilenames
    .map<boolean>((fileName: string) => {
      const candidate = path.join(directory, fileName);
      return fs.existsSync(candidate);
    })
    .reduce<string | undefined>((val, current, index) => {
      if (typeof val === 'undefined' && current) {
        return path.join(directory, supportedFilenames[index]);
      }
      return val;
    }, undefined);
}

/**
 * Scan all subdirectories for the included files, skipping any excluded
 * directories.
 * @param dir
 * @param includedFiles
 * @param excludedDirectories
 */
function* discoverFiles(
  dir: string,
  includedFiles: string[] = [],
  excludedDirectories: string[] = [],
): Generator<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const isExcluded = (fileName: string) =>
      excludedDirectories.some(exclude => fileName === exclude);
    const isIncluded = (fileName: string) =>
      includedFiles.some(include => fileName === include);
    if (file.isDirectory() && !isExcluded(file.name)) {
      yield* discoverFiles(
        path.join(dir, file.name),
        includedFiles,
        excludedDirectories,
      );
    } else if (isIncluded(file.name)) {
      yield path.join(dir, file.name);
    }
  }
}
