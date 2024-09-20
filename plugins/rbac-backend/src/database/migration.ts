import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

const migrationsDir = resolvePackagePath(
  '@janus-idp/backstage-plugin-rbac-backend', // Package name
  'migrations', // Migrations directory
);

export async function migrate(databaseManager: DatabaseService) {
  const knex = await databaseManager.getClient();

  if (!databaseManager.migrations?.skip) {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
  }
}
