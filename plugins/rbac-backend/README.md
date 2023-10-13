# RBAC backend plugin for Backstage

This plugin seamlessly integrates with the Backstage permission framework](https://backstage.io/docs/permissions/overview/) to empower you with robust role-based access control capabilities within your Backstage environment.

The Backstage permission framework is a core component of the Backstage project, designed to provide meticulous control over resource and action access. Our RBAC plugin harnesses the power of this framework, allowing you to tailor access permissions without the need for coding. Instead, you can effortlessly manage your access policies through User interface embedded within Backstage or via the configuration files.

With the RBAC plugin, you'll have the means to efficiently administer permissions within your Backstage instance by assigning them to users and groups.

## Prerequisites

Before you dive into utilizing the RBAC plugin for Backstage, there are a few essential prerequisites to ensure a seamless experience. Please review the following requirements to make sure your environment is properly set up

### Setup Permision Framework

To effectively utilize the RBAC plugin, you must have the Backstage permission framework in place. If you're using the Red Hat Developer Hub, some of these steps may have already been completed for you. However, for other Backstage application instances, please verify that the following prerequisites are satisfied:

You need to [set up the permission framework in Backstage](https://backstage.io/docs/permissions/getting-started/).Since this plugin provides a dynamic policy that replaces the traditional one, there's no need to create a policy manually. Please note that one of the requirements for permission framework is enabling the [service-to-service authentication](https://backstage.io/docs/auth/service-to-service-auth/#setup). Ensure that you complete these authentication setup steps as well.

Note: Red Hat Developer Hub users enjoy the benefit of Permission Framework and backend-to-backend authentication being enabled by default

### Identity resolver

The permission framework, and consequently, this RBAC plugin, rely on the concept of group membership. To ensure smooth operation, please follow the [Sign-in identities and resolvers](https://backstage.io/docs/auth/identity-resolver/) documentation. It's crucial that when populating groups, you include any groups that you plan to assign permissions to.

## Installation

To integrate the RBAC plugin into your Backstage instance, follow these steps.

### Installing the plugin

Add the RBAC plugin packages as dependencies by running the following command.

```SHELL
yarn workspace backend add @janus-idp/backstage-plugin-rbac-backend
```

NOTE: If you are using Red Hat Developer Hub backend plugin is pre-installed and you do not need this step.

### Configure policy admins

The RBAC plugin empowers you to manage permission policies for users and groups with a designated group of individuals known as policy administrators. These administrators are granted access to the RBAC plugin's REST API and user interface.

You can specify the policy administrators in your application configuration as follows:

```YAML
permission:
  enabled: true
  rbac:
    admin:
      users:
        - name: user:default/alice
        - name: group:default/admins
```

### Configuring policies via file

The RBAC plugin also allows you to import policies from an external file. These policies are defined in the [Casbin rules format](https://casbin.org/docs/category/the-basics), known for its simplicity and clarity. For a quick start, please refer to the format details in the provided link.

Here's an example of an external permission policies configuration file named `rbac-policy.csv`:

```CSV
p, user:default/bob, catalog-entity, read, deny
p, user:default/alice, catalog.entity.create, use, deny
```

You can specify the path to this configuration file in your application configuration:

```YAML
permission:
  enabled: true
  rbac:
    policies-csv-file: /some/path/rbac-policy.csv
```

### Configuring Database Storage for policies

The RBAC plugin offers the option to store policies in a database. It supports two database storage options:

- sqlite3: Suitable for development environments.
- postgres: Recommended for production environments.

To enable database storage for the RBAC plugin, you should configure it as follows:

```YAML
permission:
  enabled: true
  rbac:
    database:
      enabled: true
```

Ensure that you have already configured the database backend for your Backstage instance, as the RBAC plugin utilizes the same database configuration.
