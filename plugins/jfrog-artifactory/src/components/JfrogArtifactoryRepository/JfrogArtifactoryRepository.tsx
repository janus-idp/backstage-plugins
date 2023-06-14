import { useApi } from '@backstage/core-plugin-api';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './tableHeading';

import { formatDate, formatSize } from '../utils';
import { PackageEdge } from '../../types';
import { jfrogArtifactoryApiRef } from '../../api/artifactoryApi';

export function JfrogArtifactoryRepository(props: RepositoryProps) {
  const jfrogArtifactoryClient = useApi(jfrogArtifactoryApiRef);
  const classes = useStyles();
  const [packageEdges, setPackageEdges] = useState<PackageEdge[]>([]);
  const title = `Jfrog Artifactory: ${props.artifact}`;

  const { loading } = useAsync(async () => {
    const artifactResponse = await jfrogArtifactoryClient.getArtifact(
      props.artifact,
    );

    setPackageEdges(artifactResponse.data.packages.edges);

    return artifactResponse;
  });

  if (loading) {
    return <Progress />;
  }

  function displayValue<T>(value: T | undefined, defaultValue: T): T {
    return value !== undefined ? value : defaultValue;
  }

  const data = packageEdges?.flatMap((packageEdge: PackageEdge) => {
    return packageEdge.node.versions.map(version => {
      // Map repos to a string of repo names
      const reposString =
        version.repos?.map(repo => repo.name).join(', ') || 'N/A';

      return {
        repository: displayValue(packageEdge.node.name, 'N/A'),
        name: displayValue(version.name, 'N/A'),
        last_modified: displayValue(
          formatDate(packageEdge.node.created),
          'N/A',
        ),
        size: displayValue(formatSize(Number(version.size)), 'N/A'),
        downloads: displayValue(version.stats.downloadCount, 0),
        vulnerabilities_critical: displayValue(
          version.vulnerabilities?.critical,
          0,
        ),
        vulnerabilities_high: displayValue(version.vulnerabilities?.high, 0),
        vulnerabilities_medium: displayValue(
          version.vulnerabilities?.medium,
          0,
        ),
        vulnerabilities_low: displayValue(version.vulnerabilities?.low, 0),
        vulnerabilities_info: displayValue(version.vulnerabilities?.info, 0),
        vulnerabilities_unknown: displayValue(
          version.vulnerabilities?.unknown,
          0,
        ),
        vulnerabilities_skipped: displayValue(
          version.vulnerabilities?.skipped,
          0,
        ),
        repos: reposString, // Adding the repos field
        package_type: displayValue(version.package?.packageType, 'N/A'),
      };
    });
  });

  return (
    <div
      style={{ border: '1px solid #ddd' }}
      data-testid="jfrog-artifactory-repository"
    >
      <Table
        title={title}
        options={{ paging: true, padding: 'dense' }}
        data={data}
        columns={columns}
        emptyContent={
          <div className={classes.empty}>
            No data was added yet,&nbsp;
            <Link to="https://backstage.io/">learn how to add data</Link>.
          </div>
        }
      />
    </div>
  );
}

JfrogArtifactoryRepository.defaultProps = {
  title: 'Artifacts',
};

interface RepositoryProps {
  widget: boolean;
  artifact: string;
  title: string;
}
