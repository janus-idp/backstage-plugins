import { ParodosPage } from '../../ParodosPage';
import {
  ContentHeader,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { Chip, Typography } from '@material-ui/core';
import { WorkFlowLogViewer } from './WorkFlowLogViewer';
import React, { useEffect, useState } from 'react';
import { WorkFlowStepper } from './topology/WorkFlowStepper';
import { useLocation, useParams } from 'react-router-dom';
import { mockLog } from './topology/mock/mockLog';
import * as urls from '../../../urls';
import { useBackendUrl } from '../../api';
import {WorkflowStatus, WorkflowTask, WorkStatus} from '../../../models/workflowTaskSchema';

export const WorkFlowDetail = () => {
  const { executionId } = useParams();
  const { state } = useLocation();
  const { isNew, initTasks } = state;
  const [selectedTask, setSelectedTask] = useState<string | null>('');
  const [allTasks, setAllTasks] = useState<WorkflowTask[]>(initTasks);
  const [log, setLog] = useState<string>(``);
  const [countlog, setCountlog] = useState<number>(0);
  const backendUrl = useBackendUrl();

  const getSelectedTaskLog = React.useCallback(
    (templog: string) => {
      // TODO  api call to get a task log from Workflow Execution Id
      if (selectedTask !== '') setLog(templog);
    },
    [selectedTask],
  );

  // update task state regularly
  useEffect(() => {
    const updateWorks = (works: WorkStatus[]) => {
      let needUpdate = false;
      works?.forEach(work => {
        if (work.type === 'TASK') {
          const foundTask = allTasks.find(task => task.id === work.name);
          if (foundTask && foundTask.status !== work.status) {
            foundTask.status = work.status;
            needUpdate = true;
          }
        } else if (work.works)
          updateWorks(work.works);
      });
      if (needUpdate)
        setAllTasks(allTasks);
    };

    const updateWorkflowExecutionState = async (): Promise<WorkStatus[]> => {
      // TODO api call to get subsequent execution CHAIN detail
      const data = await fetch(`${backendUrl}${urls.Workflows}/${executionId}/status`);

      const response = (await data.json()) as WorkflowStatus;

      return response.works;
    };
    const taskInterval = setInterval(() => {
      updateWorkflowExecutionState().then(fetchedTasks => {
        updateWorks(fetchedTasks);
      });
    }, 5000);

    return () => clearInterval(taskInterval);
  }, [allTasks, backendUrl, executionId]);

  // update log of selected task regularly
  useEffect(() => {
    getSelectedTaskLog(
      `checking logs for ${selectedTask?.toUpperCase()}:${countlog} in execution: ${executionId}\n${mockLog}`,
    );
    const logInterval = setInterval(() => {
      let test: string = '';
      for (let i = 0; i < countlog; i++) {
        test = `${test}\nmock log line ${i}`;
      }
      getSelectedTaskLog(
        `checking logs for ${selectedTask?.toUpperCase()}:${countlog} in execution: ${executionId}\n${mockLog}${test}`,
      );
      setCountlog(countlog + 1);
    }, 3000);

    return () => clearInterval(logInterval);
  }, [countlog, executionId, getSelectedTaskLog, selectedTask]);

  return (
    <ParodosPage>
      {isNew && <Chip label="New application" color="secondary" />}
      <ContentHeader title="Onboarding">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        You are onboarding: org-name/new-project. Execution Id is {executionId}
      </Typography>
      {allTasks.length > 0 ? (
        <WorkFlowStepper tasks={allTasks} setSelectedTask={setSelectedTask} />
      ) : (
        <Progress />
      )}
      {log !== '' && <WorkFlowLogViewer log={log} />}
    </ParodosPage>
  );
};
