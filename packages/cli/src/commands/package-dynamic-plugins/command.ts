import { PackageRoles } from '@backstage/cli-node';

import { OptionValues } from 'commander';
import fs from 'fs-extra';

import os from 'os';
import path from 'path';

import { paths } from '../../lib/paths';
import { Task } from '../../lib/tasks';

export async function command(opts: OptionValues): Promise<void> {
  const { forceExport, preserveTempDir, tag } = opts;
  const workspacePackage = await fs.readJson(
    paths.resolveTarget('package.json'),
  );
  const workspacePackageRole =
    PackageRoles.detectRoleFromPackage(workspacePackage);
  const workspacePackageRoleInfo =
    workspacePackageRole !== undefined
      ? PackageRoles.getRoleInfo(workspacePackageRole)
      : undefined;
  const isMonoRepo =
    typeof workspacePackage.workspaces?.packages !== 'undefined';
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
    const { packageDirectory, packageFilePath } = pluginPkg;
    if (
      !fs.existsSync(path.join(packageDirectory, 'dist-dynamic')) ||
      forceExport
    ) {
      Task.log(
        `Running export-dynamic-plugin on plugin package ${packageFilePath}`,
      );
      try {
        await Task.forCommand(`yarn export-dynamic`, { cwd: packageDirectory });
      } catch (err) {
        Task.log(
          `Encountered an error running 'yarn export-dynamic on plugin package ${packageFilePath}, this plugin will not be packaged.  The error was ${err}`,
        );
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
  try {
    // copy the dist-dynamic output folder for each plugin to some temp directory and generate the metadata entry for each plugin
    for (const pluginPkg of packages) {
      const {
        packageDirectory,
        packageFilePath,
        packageJson,
        packageRoleInfo,
      } = pluginPkg;
      const packageName =
        packageJson.name.replace(/^@/, '').replace(/\//, '-') +
        ((packageRoleInfo && packageRoleInfo.platform) === 'node'
          ? '-dynamic'
          : '');

      const distDirectory = path.join(packageDirectory, 'dist-dynamic');
      const targetDirectory = path.join(tmpDir, packageName);
      Task.log(`Copying '${distDirectory}' to '${targetDirectory}`);
      try {
        fs.cpSync(distDirectory, targetDirectory, { recursive: true });
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
        } = packageJson;
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
      } catch (err) {
        Task.log(
          `Encountered an error copying static assets for plugin ${packageFilePath}, the plugin will not be packaged.  The error was ${err}`,
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
    // run the buildah command to generate the image
    Task.log('Creating image');
    await Task.forCommand(
      `echo "from scratch
COPY . .
" | buildah build --annotation com.redhat.rhdh.plugins='${JSON.stringify(pluginRegistryMetadata)}' -t '${tag}' -f -
    `,
      { cwd: tmpDir },
    );
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
        const packageJson = await fs.readJson(packageFilePath);
        const packageRole = PackageRoles.getRoleFromPackage(packageJson);
        const packageRoleInfo = PackageRoles.getRoleInfo(packageRole || '');
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
