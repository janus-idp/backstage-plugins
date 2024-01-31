import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRouteRef } from '@backstage/core-plugin-api';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import {
  TemplateCard,
  TemplateCardProps,
} from '@backstage/plugin-scaffolder-react/alpha';

import { WORKFLOW_TYPE } from '@janus-idp/backstage-plugin-orchestrator-common';

import { executeWorkflowRouteRef } from '../../routes';

export const OrchestratorScaffolderTemplateCard = (
  props: TemplateCardProps,
) => {
  const { onSelected } = props;
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  const onSelectedExtended = useCallback(
    (template: TemplateEntityV1beta3) => {
      const isWorkflow = template.spec.type === WORKFLOW_TYPE;

      if (!isWorkflow) {
        onSelected?.(template);
        return;
      }

      navigate(executeWorkflowLink({ workflowId: template.metadata.name }));
    },
    [executeWorkflowLink, navigate, onSelected],
  );

  return <TemplateCard {...props} onSelected={onSelectedExtended} />;
};
