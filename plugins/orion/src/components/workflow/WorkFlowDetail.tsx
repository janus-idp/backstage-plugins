import { ParodosPage } from '../ParodosPage';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Chip, Typography } from '@material-ui/core';
import { WorkFlowLogViewer } from './WorkFlowLogViewer';
import React, { useEffect, useState } from 'react';
import { WorkFlowStepper } from './topology/WorkFlowStepper';
import { useParams } from 'react-router-dom';
import { WorkFlowTask } from './topology/type/WorkFlowTask';
import { mockTasks } from './topology/mock/mockTasks';
import { mockLog } from './topology/mock/mockLog';

export const WorkFlowDetail = ({ isNew }: { isNew: boolean }) => {
  const { executionId } = useParams();
  const [selectedTask, setSelectedTask] = useState<string | null>('');
  const [allTasks, setAllTasks] = useState<WorkFlowTask[]>([]);
  const [log, setLog] = useState<string>(``);

  useEffect(() => {
    setAllTasks([]);
    const getWholeWorkflowExecutionInfo = () => {
      // TODO api call to get subsequent execution CHAIN detail
      setAllTasks(mockTasks);
    };
    getWholeWorkflowExecutionInfo();
  }, [executionId]);

  useEffect(() => {
    const getSelectedTaskLog = () => {
      // TODO  api call to get a task log from Workflow Execution Id
      if (selectedTask !== '')
        setLog(
          `checking logs for ${selectedTask?.toUpperCase()} in execution: ${executionId}\n${mockLog}`,
        );
    };
    getSelectedTaskLog();
  }, [executionId, selectedTask]);

  return (
    <ParodosPage>
      {isNew && <Chip label="New application" color="secondary" />}
      <ContentHeader title="Onboarding">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        You are onboarding: org-name/new-project. Execution Id is {executionId}
      </Typography>
      {allTasks.length > 0 && (
        <WorkFlowStepper tasks={allTasks} setSelectedTask={setSelectedTask} />
      )}
      {log !== '' && <WorkFlowLogViewer log={log} />}
    </ParodosPage>
  );
};
