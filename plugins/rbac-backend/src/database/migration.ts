import {
  PluginDatabaseManager,
  resolvePackagePath,
} from '@backstage/backend-common';

const migrationsDir = resolvePackagePath(
  '@janus-idp/backstage-plugin-rbac-backend', // Package name
  'migrations', // Migrations directory
);

export async function migrate(databaseManager: PluginDatabaseManager) {
  const knex = await databaseManager.getClient();

  if (!databaseManager.migrations?.skip) {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
  }
}
