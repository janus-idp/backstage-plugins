import React, { useMemo } from 'react';

import { InfoCard } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Link,
  Typography,
} from '@material-ui/core';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { executeWorkflowRouteRef } from '../../routes';

interface AssessmentResultViewerProps {
  result: Record<string, unknown> | string | undefined;
}

interface WorkflowOption {
  id: string;
  name: string;
}

export const AssessmentResultViewer = (props: AssessmentResultViewerProps) => {
  const { result } = props;

  const jsonSource = useMemo(() => {
    if (!result) {
      return undefined;
    }
    if (typeof result === 'string') {
      return JSON.parse(result);
    }
    return result;
  }, [result]);

  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  const keyToTitle = (key: string) => {
    const title = key.replace(/([a-z])([A-Z])/g, '$1 $2');
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  const accordionProps = (items: WorkflowOption | WorkflowOption[]) => {
    if (!Array.isArray(items)) return { expanded: true };
    if (Array.isArray(items) && items.length === 0) return { disabled: true };
    return {};
  };

  const workflowLinks = (items: WorkflowOption | WorkflowOption[]) => {
    if (!Array.isArray(items)) {
      const workflowOption: WorkflowOption = items;
      return (
        <>
          <Link href={executeWorkflowLink({ workflowId: workflowOption.id })}>
            {workflowOption.name}
          </Link>
          &nbsp;&nbsp;
          <Chip label="Recommended" size="small" />
        </>
      );
    }
    return items.map(item => {
      const workflowOption: WorkflowOption = item;
      return (
        <>
          <Link href={executeWorkflowLink({ workflowId: workflowOption.id })}>
            {workflowOption.name}
          </Link>
          <br />
        </>
      );
    });
  };

  const workflowOptions = (
    category: string,
    items: WorkflowOption | WorkflowOption[],
  ) => {
    return (
      <Accordion key={category} {...accordionProps(items)}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>{keyToTitle(category)}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{workflowLinks(items)}</Typography>
        </AccordionDetails>
      </Accordion>
    );
  };

  const assessmentOutput = (output: any) => {
    if (
      output === undefined ||
      output?.workflowdata?.workflowOptions === undefined
    )
      return null;
    const rows = Object.entries(output.workflowdata.workflowOptions).map(
      ([key, value]) =>
        workflowOptions(key, value as WorkflowOption | WorkflowOption[]),
    );
    return <InfoCard title="Assessement Results">{rows}</InfoCard>;
  };
  return assessmentOutput(jsonSource);
};
