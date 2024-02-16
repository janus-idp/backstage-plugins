import React from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress, Grid } from '@material-ui/core';

import { IstioConfigCard } from '../../components/IstioConfigCard/IstioConfigCard';
import { isIstioNamespace, serverConfig } from '../../config';
import { kialiApiRef } from '../../services/Api';
import { WorkloadHealth } from '../../types/Health';
import {
  IstioConfigItem,
  IstioConfigList,
  toIstioItems,
} from '../../types/IstioConfigList';
import {
  ObjectCheck,
  Validations,
  ValidationTypes,
} from '../../types/IstioObjects';
import { Workload } from '../../types/Workload';
import { WorkloadPods } from './WorkloadPods';
import { WorkloadDescription } from './WorkloadsDescription';

type WorkloadInfoProps = {
  duration?: number;
  namespace?: string;
  workload?: Workload;
  health?: WorkloadHealth;
};

export const WorkloadInfo = (workloadProps: WorkloadInfoProps) => {
  const pods = workloadProps.workload?.pods || [];
  const namespace = workloadProps.namespace ? workloadProps.namespace : '';
  const kialiClient = useApi(kialiApiRef);
  const [istioConfig, setIstioConfig] = React.useState<IstioConfigList>();
  const [istioValidations, setIstioValidations] = React.useState<
    IstioConfigItem[] | undefined
  >();
  const workloadIstioResources = [
    'gateways',
    'authorizationpolicies',
    'peerauthentications',
    'sidecars',
    'requestauthentications',
    'envoyfilters',
  ];
  const labels = workloadProps.workload?.labels
    ? workloadProps.workload?.labels
    : {};
  const wkLabels: string[] = [];
  Object.keys(labels).forEach(key => {
    const label = key + (labels[key] ? `=${labels[key]}` : '');
    wkLabels.push(label);
  });
  const workloadSelector = wkLabels.join(',');

  const wkIstioTypes = [
    { field: 'gateways', validation: 'gateway' },
    { field: 'sidecars', validation: 'sidecar' },
    { field: 'envoyFilters', validation: 'envoyfilter' },
    { field: 'requestAuthentications', validation: 'requestauthentication' },
    { field: 'authorizationPolicies', validation: 'authorizationpolicy' },
    { field: 'peerAuthentications', validation: 'peerauthentication' },
  ];

  const getValidations = () => {
    const istioConfigItems = istioConfig
      ? toIstioItems(istioConfig, workloadProps.workload?.cluster || '')
      : [];

    if (workloadProps.workload) {
      if (istioConfig?.validations) {
        const typeNames: { [key: string]: string[] } = {};
        wkIstioTypes.forEach(wkIstioType => {
          if (istioConfig && istioConfig.validations[wkIstioType.validation]) {
            typeNames[wkIstioType.validation] = [];
            // @ts-ignore
            istioConfig[wkIstioType.field]?.forEach(r =>
              typeNames[wkIstioType.validation].push(r.metadata.name),
            );
          }
        });
      }
    }
    setIstioValidations(istioConfigItems);
  };

  const fetchIstioConfig = async () => {
    kialiClient
      .getIstioConfig(
        namespace,
        workloadIstioResources,
        true,
        '',
        workloadSelector,
        workloadProps.workload?.cluster,
      )
      .then((istioConfigResponse: IstioConfigList) => {
        setIstioConfig(istioConfigResponse);
        getValidations();
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      fetchIstioConfig();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);
  if (loading) {
    return <CircularProgress />;
  }

  // All information for validations is fetched in the workload, no need to add another call
  const workloadValidations = (workload: Workload): Validations => {
    const noIstiosidecar: ObjectCheck = {
      message: 'Pod has no Istio sidecar',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const noAppLabel: ObjectCheck = {
      message: 'Pod has no app label',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const noVersionLabel: ObjectCheck = {
      message: 'Pod has no version label',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const pendingPod: ObjectCheck = {
      message: 'Pod is in Pending Phase',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const unknownPod: ObjectCheck = {
      message: 'Pod is in Unknown Phase',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const failedPod: ObjectCheck = {
      message: 'Pod is in Failed Phase',
      severity: ValidationTypes.Error,
      path: '',
    };
    const failingPodContainer: ObjectCheck = {
      message: 'Pod has failing container',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const failingPodIstioContainer: ObjectCheck = {
      message: 'Pod has failing Istio container',
      severity: ValidationTypes.Warning,
      path: '',
    };
    const failingPodAppContainer: ObjectCheck = {
      message: 'Pod has failing app container',
      severity: ValidationTypes.Warning,
      path: '',
    };

    const istioLabels = serverConfig.istioLabels;
    const istioAnnotations = serverConfig.istioAnnotations;

    const validations: Validations = {};
    const isWaypoint =
      serverConfig.ambientEnabled &&
      workload.labels &&
      workload.labels[istioLabels.ambientWaypointLabel] ===
        istioLabels.ambientWaypointLabelValue;

    if (workload.pods.length > 0) {
      validations.pod = {};
      workload.pods.forEach(pod => {
        validations.pod[pod.name] = {
          name: pod.name,
          objectType: 'pod',
          valid: true,
          checks: [],
        };
        if (!isIstioNamespace(namespace)) {
          if (!isWaypoint) {
            if (!pod.istioContainers || pod.istioContainers.length === 0) {
              if (
                !(
                  serverConfig.ambientEnabled &&
                  (pod.annotations
                    ? pod.annotations[istioAnnotations.ambientAnnotation] ===
                      istioAnnotations.ambientAnnotationEnabled
                    : false)
                )
              ) {
                validations.pod[pod.name].checks.push(noIstiosidecar);
              }
            } else {
              pod.istioContainers.forEach(c => {
                if (
                  !c.isReady &&
                  validations.pod[pod.name].checks.indexOf(
                    failingPodIstioContainer,
                  ) === -1
                ) {
                  validations.pod[pod.name].checks.push(
                    failingPodIstioContainer,
                  );
                }
              });
            }
            if (!pod.containers || pod.containers.length === 0) {
              validations.pod[pod.name].checks.push(failingPodContainer);
            } else {
              pod.containers.forEach(c => {
                if (
                  !c.isReady &&
                  validations.pod[pod.name].checks.indexOf(
                    failingPodAppContainer,
                  ) === -1
                ) {
                  validations.pod[pod.name].checks.push(failingPodAppContainer);
                }
              });
            }
            if (!pod.labels) {
              validations.pod[pod.name].checks.push(noAppLabel);
              validations.pod[pod.name].checks.push(noVersionLabel);
            } else {
              if (!pod.appLabel) {
                validations.pod[pod.name].checks.push(noAppLabel);
              }
              if (!pod.versionLabel) {
                validations.pod[pod.name].checks.push(noVersionLabel);
              }
            }
          }
        }

        switch (pod.status) {
          case 'Pending':
            validations.pod[pod.name].checks.push(pendingPod);
            break;
          case 'Unknown':
            validations.pod[pod.name].checks.push(unknownPod);
            break;
          case 'Failed':
            validations.pod[pod.name].checks.push(failedPod);
            break;
          default:
          // Pod healthy
        }
        // If statusReason is present
        if (pod.statusReason) {
          validations.pod[pod.name].checks.push({
            message: pod.statusReason,
            severity: ValidationTypes.Warning,
            path: '',
          });
        }
        validations.pod[pod.name].valid =
          validations.pod[pod.name].checks.length === 0;
      });
    }
    return validations;
  };

  return (
    <>
      {workloadProps.workload && (
        <Grid container spacing={1} style={{ paddingTop: '20px' }}>
          <Grid key={`Card_${workloadProps.workload?.name}`} item xs={4}>
            <WorkloadDescription
              workload={workloadProps.workload}
              health={workloadProps.health}
              namespace={workloadProps.namespace}
            />
          </Grid>
          <Grid key={`Card_${workloadProps.workload?.name}`} item xs={4}>
            <WorkloadPods
              namespace={namespace}
              workload={workloadProps.workload?.name || ''}
              pods={pods}
              validations={
                workloadProps.workload
                  ? workloadValidations(workloadProps.workload).pod || {}
                  : {}
              }
            />
          </Grid>
          <Grid key={`Card_${workloadProps.workload?.name}`} item xs={4}>
            <IstioConfigCard
              name={workloadProps.workload ? workloadProps.workload.name : ''}
              items={istioValidations ? istioValidations : []}
            />
          </Grid>
        </Grid>
      )}
    </>
  );
};
