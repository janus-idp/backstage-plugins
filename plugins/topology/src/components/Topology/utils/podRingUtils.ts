import * as React from 'react';
import { ChartLabel } from '@patternfly/react-charts';
import classNames from 'classnames';
import { getPodStatus } from './workloadNodeUtils';
import { AllPodStatus } from '../components/Pods/pod';
import { ExtPodKind } from '../types/pods';
import { K8sResourceKind } from '../types/types';

const getTitleComponent = (
  longTitle: boolean = false,
  longSubtitle: boolean = false,
  reversed: boolean = false,
) => {
  const labelClasses = classNames('pf-chart-donut-title', {
    'pod-ring__center-text--reversed': reversed,
    'pod-ring__center-text': !reversed,
    'pod-ring__long-text': longTitle,
  });
  return React.createElement(ChartLabel, {
    dy: longSubtitle ? -5 : 0,
    style: { lineHeight: '11px' },
    className: labelClasses,
  });
};

const podKindString = (count: number) => (count === 1 ? 'Pod' : 'Pods');

const isPendingPods = (
  pods: ExtPodKind[],
  currentPodCount: number,
  desiredPodCount: number,
): boolean =>
  (pods?.length === 1 && pods[0].status?.phase === 'Pending') ||
  (!currentPodCount && !!desiredPodCount);

export const getFailedPods = (pods: any[]): number => {
  if (!pods?.length) {
    return 0;
  }

  return pods.reduce((acc, currValue) => {
    if (
      [AllPodStatus.CrashLoopBackOff, AllPodStatus.Failed].includes(
        getPodStatus(currValue),
      )
    ) {
      return acc + 1;
    }
    return acc;
  }, 0);
};

const getTitleAndSubtitle = (
  isPending: boolean,
  currentPodCount: number,
  desiredPodCount: number,
) => {
  let titlePhrase;
  let subTitlePhrase = '';
  let longTitle = false;
  let longSubtitle = false;

  // handles the initial state when the first pod is coming up and the state for no pods(scaled to zero)
  if (!currentPodCount) {
    titlePhrase = isPending ? '0' : 'Scaled to 0';
    longTitle = !isPending;
    if (desiredPodCount) {
      subTitlePhrase = `Scaling to ${desiredPodCount}`;
      longSubtitle = true;
    }
  }

  // handles the idle state or scaling to desired no. of pods
  if (currentPodCount) {
    titlePhrase = currentPodCount.toString();
    if (currentPodCount === desiredPodCount) {
      subTitlePhrase = podKindString(currentPodCount);
    } else {
      subTitlePhrase = `Scaling to ${desiredPodCount}`;
      longSubtitle = true;
    }
  }

  return {
    title: titlePhrase,
    longTitle,
    subTitle: subTitlePhrase,
    longSubtitle,
  };
};

export const podRingLabel = (
  obj: K8sResourceKind,
  ownerKind: string,
  pods: ExtPodKind[],
) => {
  let currentPodCount;
  let desiredPodCount;
  let isPending;
  let titleData;
  const podRingLabelData = {
    title: '',
    subTitle: '',
    longTitle: false,
    longSubtitle: false,
    reversed: false,
  };

  const failedPodCount = getFailedPods(pods);
  switch (ownerKind) {
    case 'Pod':
      podRingLabelData.title = '1';
      podRingLabelData.subTitle = 'Pod';
      break;
    default:
      currentPodCount = (obj?.status?.readyReplicas || 0) + failedPodCount;
      desiredPodCount = obj?.spec?.replicas;
      isPending = isPendingPods(pods, currentPodCount, desiredPodCount);
      titleData = getTitleAndSubtitle(
        isPending,
        currentPodCount,
        desiredPodCount,
      );
      podRingLabelData.title = titleData.title as string;
      podRingLabelData.subTitle = titleData.subTitle;
      podRingLabelData.longTitle = titleData.longTitle;
      podRingLabelData.longSubtitle = titleData.longSubtitle;
      break;
  }

  return podRingLabelData;
};

export const usePodRingLabel = (
  obj: K8sResourceKind,
  ownerKind: string,
  pods: ExtPodKind[],
) => {
  const podRingLabelData = podRingLabel(obj, ownerKind, pods);
  const { title, subTitle, longTitle, longSubtitle, reversed } =
    podRingLabelData;

  return React.useMemo(
    () => ({
      title,
      subTitle,
      titleComponent: getTitleComponent(longTitle, longSubtitle, reversed),
    }),
    [longSubtitle, longTitle, reversed, subTitle, title],
  );
};
