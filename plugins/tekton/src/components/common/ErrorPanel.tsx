import * as React from 'react';
import { WarningPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Typography } from '@material-ui/core';
import { ClusterError, ClusterErrors } from '../../types/types';

export const ErrorPanel: React.FC<{ allErrors: ClusterErrors }> = ({
  allErrors,
}) => {
  const {
    entity: {
      metadata: { name: entityName },
    },
  } = useEntity();
  return (
    <div className="warning-panel" style={{ marginBottom: '16px' }}>
      <WarningPanel
        title="There was a problem retrieving Kubernetes objects"
        message={`There was a problem retrieving some Kubernetes resources for the entity: ${entityName}. This could mean that the Error Reporting card is not completely accurate.`}
      >
        <div>
          Errors:
          {allErrors.map((err: ClusterError, index) => {
            const errMessage = err.message
              ? `${err.message}`
              : `Error fetching Kubernetes resource: '${err.resourcePath}', error: ${err.errorType}, status code: ${err.statusCode}`;
            return (
              <Typography variant="body2" key={index}>
                {err.errorType === 'FETCH_ERROR'
                  ? `Error communicating with Kubernetes: ${err.errorType}, message: ${err.message}`
                  : errMessage}
              </Typography>
            );
          })}
        </div>
      </WarningPanel>
    </div>
  );
};

export default ErrorPanel;
