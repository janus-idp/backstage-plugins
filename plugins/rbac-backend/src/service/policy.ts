// import { AuthorizeResult, PolicyDecision, isResourcePermission } from "@backstage/plugin-permission-common";
// import { PolicyQuery, PermissionPolicy } from "@backstage/plugin-permission-node";
// import { BackstageIdentityResponse } from "@backstage/plugin-auth-node";

// class TestPermissionPolicy implements PermissionPolicy {

//     async handle(request: PolicyQuery, user?: BackstageIdentityResponse): Promise<PolicyDecision> {
//         if (request.permission.name === 'catalog.entity.read') {
//           return { result: AuthorizeResult.ALLOW };
//         }

//         const catalogWriters = user?.identity.ownershipEntityRefs.filter(entityRef => entityRef === 'group:default/catalog-writers');
//         // 'catalog-entity' has a type "resource". It joins three permissions for "catalog" plugin.
//         // - catalog.entity.read
//         // - catalog.entity.update
//         // - catalog.entity.delete
//         if (isResourcePermission(request.permission, 'catalog-entity') && catalogWriters) {
//           return { result: AuthorizeResult.ALLOW };
//         }
//         // 'catalog.entity.create has a type "basic". Also we need one more basic permission catalog.location.create to
//         // have opportunity import catalog from github and other source control manager providers.
//         if ((request.permission.name === 'catalog.entity.create' || 'catalog.location.create') && catalogWriters) {
//           return { result: AuthorizeResult.ALLOW };
//         }

//         return { result: AuthorizeResult.DENY };
//       }
// }
