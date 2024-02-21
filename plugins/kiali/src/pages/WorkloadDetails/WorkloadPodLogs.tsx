import * as React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAsyncFn, useDebounce } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Input,
  List,
  Select,
  Toolbar,
  Tooltip,
} from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { Alert } from '@material-ui/lab';
import memoize from 'micro-memoize';
import moment from 'moment';
import screenfull, { Screenfull } from 'screenfull';

import { history, URLParam } from '../../app/History';
import { AccessLogModal } from '../../components/Envoy/AccessLogModal';
import { RenderComponentScroll } from '../../components/Nav/Page/RenderComponentScroll';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { PFColors, PFColorVal } from '../../components/Pf/PfColors';
import { ToolbarDropdown } from '../../components/ToolbarDropdown/ToolbarDropdown';
import { serverConfig } from '../../config';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  evalTimeRange,
  TimeInMilliseconds,
  TimeInSeconds,
  TimeRange,
} from '../../types/Common';
import { AccessLog, LogEntry, Pod, PodLogs } from '../../types/IstioObjects';
import { Span, TracingQuery } from '../../types/Tracing';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import { formatDuration } from '../../utils/tracing/TracingHelper';

const appContainerColors = [
  PFColors.Blue300,
  PFColors.Green300,
  PFColors.Purple100,
  PFColors.Orange400,
];
const proxyContainerColor = PFColors.Gold400;
const spanColor = PFColors.Cyan300;

type ReduxProps = {
  timeRange: TimeRange;
};

export type WorkloadPodLogsProps = ReduxProps & {
  cluster?: string;
  lastRefreshAt: TimeInMilliseconds;
  namespace: string;
  pods: Pod[];
  workload: string;
};

type ContainerOption = {
  color: PFColorVal;
  displayName: string;
  isProxy: boolean;
  isSelected: boolean;
  name: string;
};

type Entry = {
  logEntry?: LogEntry;
  span?: Span;
  timestamp: string;
  timestampUnix: TimeInSeconds;
};

const logListStyle: React.CSSProperties = {
  overflow: 'auto !important',
  paddingTop: '0.375rem',
  paddingBottom: '0.75rem',
};

interface WorkloadPodLogsState {
  accessLogModals: Map<string, AccessLog>;
  containerOptions?: ContainerOption[];
  entries: Entry[];
  fullscreen: boolean;
  hideError?: string;
  hideLogValue: string;
  isTimeOptionsOpen: boolean;
  kebabOpen: boolean;
  linesTruncatedContainers: string[];
  loadingLogs: boolean;
  loadingLogsError?: string;
  logWindowSelections: any[];
  maxLines: number;
  podValue?: number;
  showClearHideLogButton: boolean;
  showClearShowLogButton: boolean;
  showError?: string;
  showLogValue: string;
  showSpans: boolean;
  showTimestamps: boolean;
  showToolbar: boolean;
  useRegex: boolean;
}

// LogLevel are the log levels supported by the proxy.
enum LogLevel {
  Off = 'off',
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
}

const NoLogsFoundMessage = 'No container logs found for the time period.';

const MaxLinesOptions = {
  '-1': 'All lines',
  '100': '100 lines',
  '500': '500 lines',
  '1000': '1000 lines',
  '3000': '3000 lines',
  '5000': '5000 lines',
  '10000': '10000 lines',
  '25000': '25000 lines',
};

const alInfoIcon = kialiStyle({
  display: 'flex',
  width: '0.75rem',
});

const infoIcons = kialiStyle({
  marginLeft: '0.5em',
  marginTop: '30%',
  width: '1.5rem',
});

const toolbarTail = kialiStyle({
  marginTop: '0.125rem',
});

const logsDiv = kialiStyle({
  marginRight: '0.5rem',
});

const logsDisplay = kialiStyle({
  fontFamily: 'monospace',
  margin: 0,
  padding: 0,
  resize: 'none',
  whiteSpace: 'pre',
  width: '100%',
});

const iconStyle = kialiStyle({
  marginLeft: '0.5rem',
});

const checkboxStyle = kialiStyle({
  marginLeft: '0.5rem',
  marginRight: '1rem',
});

const noLogsStyle = kialiStyle({
  paddingTop: '0.75rem',
  paddingLeft: '0.75rem',
});

const logLineStyle = kialiStyle({
  display: 'flex',
  height: '1.5rem',
  lineHeight: '1.5rem',
  paddingLeft: '0.75rem',
});

const logInfoStyle = kialiStyle({
  paddingLeft: 0,
  width: '0.75rem',
  height: '0.75rem',
  fontFamily: 'monospace',
  fontSize: '0.75rem',
});

const logMessaageStyle = kialiStyle({
  fontSize: '0.75rem',
  paddingRight: '1rem',
});

const logsBackground = (enabled: boolean): React.CSSProperties => ({
  backgroundColor: enabled ? PFColors.Black1000 : PFColors.Black500,
});

const logsHeight = (
  showToolbar: boolean,
  fullscreen: boolean,
  showMaxLinesWarning: boolean,
): React.CSSProperties => {
  const toolbarHeight = showToolbar ? '0px' : '49px';
  const maxLinesWarningHeight = showMaxLinesWarning ? '27px' : '0px';

  return {
    height: fullscreen
      ? `calc(100vh - 130px + ${toolbarHeight} - ${maxLinesWarningHeight})`
      : `calc(var(--kiali-details-pages-tab-content-height) - 155px + ${toolbarHeight} - ${maxLinesWarningHeight})`,
  };
};

const formatDate = (timestamp: string): string => {
  const entryTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS');

  return entryTimestamp;
};

export const WorkloadPodLogs = (props: WorkloadPodLogsProps) => {
  const promises: PromisesRegistry = new PromisesRegistry();
  const podOptions: string[] = [];
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const getContainerOptions = (pod: Pod): ContainerOption[] => {
    // sort containers by name, consistently positioning proxy container first.
    let containers = [...(pod.istioContainers ?? [])];
    containers.push(...(pod.containers ?? []));

    containers = containers.sort((c1, c2) => {
      if (c1.isProxy !== c2.isProxy) {
        return c1.isProxy ? 0 : 1;
      }
      return c1.name < c2.name ? 0 : 1;
    });

    let appContainerCount = 0;
    const containerOptions = containers.map(c => {
      const name = c.name;

      if (c.isProxy) {
        return {
          color: proxyContainerColor,
          displayName: name,
          isProxy: true,
          isSelected: true,
          name: name,
        };
      }

      const color =
        appContainerColors[appContainerCount++ % appContainerColors.length];
      return {
        color: color,
        displayName: name,
        isProxy: false,
        isSelected: true,
        name: name,
      };
    });

    return containerOptions;
  };
  const pod = props.pods[0];
  const initState: WorkloadPodLogsState = {
    accessLogModals: new Map<string, AccessLog>(),
    containerOptions: getContainerOptions(pod),
    entries: [],
    fullscreen: false,
    hideLogValue: '',
    isTimeOptionsOpen: false,
    kebabOpen: false,
    linesTruncatedContainers: [],
    loadingLogs: false,
    logWindowSelections: [],
    podValue: 0,
    maxLines: 100,
    showClearHideLogButton: true,
    showClearShowLogButton: true,
    showSpans: false,
    showTimestamps: false,
    showToolbar: true,
    showLogValue: '',
    useRegex: false,
  };
  const [workloadPodLogsState, setWorkloadPodLogsState] =
    React.useState<WorkloadPodLogsState>(initState);

  const toggleSpans = (checked: boolean): void => {
    const urlParams = new URLSearchParams(history.location.search);
    urlParams.set(URLParam.SHOW_SPANS, String(checked));
    history.replace(`${history.location.pathname}?${urlParams.toString()}`);

    workloadPodLogsState.showSpans = !workloadPodLogsState.showSpans;
    console.log('togle spans');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);
  };

  const toggleSelected = (c: ContainerOption): void => {
    c.isSelected = !c.isSelected;
    workloadPodLogsState.containerOptions = [
      ...workloadPodLogsState.containerOptions!,
    ];
    console.log('togle selected');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);
  };

  const getContainerLegend = (): React.ReactNode => {
    return (
      <div
        data-test="workload-logs-pod-containers"
        style={{ marginTop: '0.375rem' }}
      >
        <div id="container-log-selection">
          <PFBadge
            badge={{ badge: PFBadges.Container.badge, tt: 'Containers' }}
            style={{ marginRight: '0.75rem', height: '1.25rem' }}
            position="top"
          />

          {workloadPodLogsState.containerOptions!.map((c, i) => {
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    id={`container-${c.displayName}`}
                    key={`c-d-${i}`}
                    className={checkboxStyle}
                    checked={c.isSelected}
                    onChange={() => toggleSelected(c)}
                  />
                }
                label={
                  <span
                    style={{
                      color: c.color,
                      fontWeight: 'bold',
                    }}
                  >
                    {c.displayName}
                  </span>
                }
              />
            );
          })}
        </div>
      </div>
    );
  };

  // filteredEntries is a memoized function which returns the set of entries that should be visible in the
  // logs pane, given the values of show and hide filter, and given the "use regex" configuration.
  // When the function is called for the first time with certain combination of parameters, the set of filtered
  // entries is calculated, cached and returned. Thereafter, if the function is called with the same values, the
  // cached set is returned; otherwise, a new set is re-calculated, re-cached and returned, and the old
  // set is discarded.
  const filteredEntries = memoize(
    (
      entries: Entry[],
      showValue: string,
      hideValue: string,
      useRegex: boolean,
    ) => {
      let filteredEntriesM = entries;

      if (!!showValue) {
        if (useRegex) {
          try {
            const regexp = RegExp(showValue);
            filteredEntriesM = filteredEntriesM.filter(
              e => !e.logEntry || regexp.test(e.logEntry.message),
            );

            if (!!workloadPodLogsState.showError) {
              workloadPodLogsState.showError = undefined;
              console.log('filteredentries');
              console.log(workloadPodLogsState);
              setWorkloadPodLogsState(workloadPodLogsState);
            }
          } catch (e) {
            if (e instanceof Error) {
              workloadPodLogsState.showError = `Show: ${e.message}`;
              console.log('filtered 2');
              console.log(workloadPodLogsState);
              setWorkloadPodLogsState(workloadPodLogsState);
            }
          }
        } else {
          filteredEntriesM = filteredEntriesM.filter(
            e => !e.logEntry || e.logEntry.message.includes(showValue),
          );
        }
      }

      if (!!hideValue) {
        if (useRegex) {
          try {
            const regexp = RegExp(hideValue);
            filteredEntriesM = filteredEntriesM.filter(
              e => !e.logEntry || !regexp.test(e.logEntry.message),
            );

            if (!!workloadPodLogsState.hideError) {
              workloadPodLogsState.hideError = undefined;
              console.log('hide value');
              console.log(workloadPodLogsState);
              setWorkloadPodLogsState(workloadPodLogsState);
            }
          } catch (e) {
            if (e instanceof Error) {
              workloadPodLogsState.hideError = `Hide: ${e.message}`;
              console.log('hide value');
              console.log(workloadPodLogsState);
              setWorkloadPodLogsState(workloadPodLogsState);
            }
          }
        } else {
          filteredEntriesM = filteredEntriesM.filter(
            e => !e.logEntry || !e.logEntry.message.includes(hideValue),
          );
        }
      }

      return filteredEntriesM;
    },
  );

  const gotoSpan = (span: Span): void => {
    const link =
      `/namespaces/${props.namespace}/workloads/${props.workload}` +
      `?tab=traces&${URLParam.TRACING_TRACE_ID}=${span.traceID}&${URLParam.TRACING_SPAN_ID}=${span.spanID}`;
    history.push(link);
  };

  const entryToString = (entry: Entry): string => {
    if (entry.logEntry) {
      const le = entry.logEntry;
      return workloadPodLogsState.showTimestamps
        ? `${formatDate(entry.timestamp)} ${le.message}`
        : le.message;
    }

    const { duration, operationName } = entry.span!;
    return `duration: ${formatDuration(
      duration,
    )}, operationName: ${operationName}`;
  };

  const addAccessLogModal = (k: string, v: AccessLog): void => {
    const accessLogModals = new Map<string, AccessLog>(
      workloadPodLogsState.accessLogModals,
    );
    accessLogModals.set(k, v);
    workloadPodLogsState.accessLogModals = accessLogModals;
    console.log('acceslog modal');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);
  };

  const renderLogLine = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }): React.ReactNode => {
    const e = filteredEntries(
      workloadPodLogsState.entries,
      workloadPodLogsState.showLogValue,
      workloadPodLogsState.hideLogValue,
      workloadPodLogsState.useRegex,
    )[index];

    if (e.span) {
      return (
        <div key={`s-${index}`} className={logLineStyle} style={{ ...style }}>
          {workloadPodLogsState.showTimestamps && (
            <span
              key={`al-s-${index}`}
              className={logMessaageStyle}
              style={{ color: spanColor }}
            >
              {e.timestamp}
            </span>
          )}
          <Tooltip
            key={`al-tt-${index}`}
            title="Click to navigate to span detail"
          >
            <Button
              key={`s-b-${index}`}
              className={logInfoStyle}
              onClick={() => {
                gotoSpan(e.span!);
              }}
            >
              <KialiIcon.Info
                key={`al-i-${index}`}
                className={alInfoIcon}
                color={spanColor}
              />
            </Button>
          </Tooltip>
          <p
            key={`al-p-${index}`}
            className={logMessaageStyle}
            style={{ color: spanColor }}
          >
            {entryToString(e)}
          </p>
        </div>
      );
    }

    const le = e.logEntry!;
    const messageColor = le.color! ?? PFColors.Color200;

    return !le.accessLog ? (
      <div key={`le-d-${index}`} className={logLineStyle} style={{ ...style }}>
        <p
          key={`le-${index}`}
          className={logMessaageStyle}
          style={{ color: messageColor }}
        >
          {entryToString(e)}
        </p>
      </div>
    ) : (
      <div key={`al-${index}`} className={logLineStyle} style={{ ...style }}>
        {workloadPodLogsState.showTimestamps && (
          <span
            key={`al-s-${index}`}
            className={logMessaageStyle}
            style={{ color: messageColor }}
          >
            {formatDate(le.timestamp)}
          </span>
        )}

        <Tooltip
          key={`al-tt-${index}`}
          title="Click for Envoy Access Log details"
        >
          <Button
            key={`al-b-${index}`}
            className={logInfoStyle}
            onClick={() => {
              addAccessLogModal(le.message, le.accessLog!);
            }}
          >
            <KialiIcon.Info
              key={`al-i-${index}`}
              className={alInfoIcon}
              color={messageColor}
            />
          </Button>
        </Tooltip>

        <p
          key={`al-p-${index}`}
          className={logMessaageStyle}
          style={{ color: messageColor }}
        >
          {le.message}
        </p>
      </div>
    );
  };

  const setLogLevel = (level: LogLevel): void => {
    workloadPodLogsState.kebabOpen = false;
    console.log('set log level');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);

    const podL = props.pods[workloadPodLogsState.podValue!];

    kialiClient
      .setPodEnvoyProxyLogLevel(
        props.namespace,
        podL.name,
        level,
        props.cluster,
      )
      .then((_resp: any) => {
        kialiState.alertUtils!.add(
          `Successfully updated proxy log level to '${level}' for pod: ${podL.name}`,
        );
      })
      .catch((error: any) => {
        kialiState.alertUtils!.add(`Unable to set proxy pod level: ${error}`);
      });
  };

  const getLogsDiv = (): React.ReactNode => {
    const hasProxyContainer = workloadPodLogsState.containerOptions?.some(
      opt => opt.isProxy,
    );

    const logDropDowns = Object.keys(LogLevel).map(level => {
      return (
        <Select
          key={`setLogLevel${level}`}
          onClick={() => {
            // @ts-ignore
            setLogLevel(LogLevel[level]);
          }}
          disabled={serverConfig.deployment.viewOnlyMode}
        >
          {level}
        </Select>
      );
    });

    const toggleToolbar = (): void => {
      workloadPodLogsState.showToolbar = !workloadPodLogsState.showToolbar;
      workloadPodLogsState.kebabOpen = false;
      console.log('togle toolbar');
      console.log(workloadPodLogsState);
      setWorkloadPodLogsState(workloadPodLogsState);
    };

    const toggleShowTimestamps = (): void => {
      workloadPodLogsState.showTimestamps =
        !workloadPodLogsState.showTimestamps;
      workloadPodLogsState.kebabOpen = false;
      console.log('togle timestamps');
      console.log(workloadPodLogsState);
      setWorkloadPodLogsState(workloadPodLogsState);
    };

    const toggleUseRegex = (): void => {
      workloadPodLogsState.useRegex = !workloadPodLogsState.useRegex;
      workloadPodLogsState.kebabOpen = false;
      console.log('togle regex');
      console.log(workloadPodLogsState);
      setWorkloadPodLogsState(workloadPodLogsState);
    };

    const kebabActions = [
      <MenuItem key="toggleToolbar" onClick={toggleToolbar}>
        {`${workloadPodLogsState.showToolbar ? 'Collapse' : 'Expand'} Toolbar`}
      </MenuItem>,

      <MenuItem key="toggleRegex" onClick={toggleUseRegex}>
        {`Match via ${workloadPodLogsState.useRegex ? 'Substring' : 'Regex'}`}
      </MenuItem>,

      <MenuItem key="toggleTimestamps" onClick={toggleShowTimestamps}>
        {`${
          workloadPodLogsState.showTimestamps ? 'Remove' : 'Show'
        } Timestamps`}
      </MenuItem>,

      <Divider key="logLevelSeparator" />,

      <MenuItem key="setLogLevels">
        {hasProxyContainer && logDropDowns}
      </MenuItem>,
    ];

    const logEntries = workloadPodLogsState.entries
      ? filteredEntries(
          workloadPodLogsState.entries,
          workloadPodLogsState.showLogValue,
          workloadPodLogsState.hideLogValue,
          workloadPodLogsState.useRegex,
        )
      : [];

    const setKebabOpen = (kebabOpen: boolean): void => {
      workloadPodLogsState.kebabOpen = !kebabOpen;
      console.log('kebab');
      console.log(workloadPodLogsState);
      setWorkloadPodLogsState(workloadPodLogsState);
    };

    const entriesToString = (entries: Entry[]): string => {
      return entries.map(entry => entryToString(entry)).join('\n');
    };

    const toggleFullscreen = (): void => {
      const screenFullAlias = screenfull as Screenfull; // this casting was necessary

      if (screenFullAlias.isFullscreen) {
        screenFullAlias.exit();
      } else {
        const element = document.getElementById('logs');

        if (screenFullAlias.isEnabled) {
          if (element) {
            screenFullAlias.request(element);
          }
        }
      }
    };

    const hasEntries = (entries: Entry[]): boolean =>
      !!entries && entries.length > 0;

    const renderLogs = (): React.ReactElement => {
      return (
        <>
          {workloadPodLogsState.entries.map((_, index) => {
            return renderLogLine({ index: index, style: logListStyle });
          })}
        </>
      );
    };

    return (
      <div key="logsDiv" id="logsDiv" className={logsDiv}>
        <Toolbar style={{ padding: '0.25rem 0' }}>
          {getContainerLegend()}

          <Tooltip key="copy_logs" title="Copy logs to clipboard">
            <CopyToClipboard
              text={entriesToString(workloadPodLogsState.entries)}
            >
              <Button>
                <KialiIcon.Copy />
                <span className={iconStyle}>Copy</span>
              </Button>
            </CopyToClipboard>
          </Tooltip>

          <Tooltip key="fullscreen_logs" title="Expand logs full screen">
            <Button
              onClick={toggleFullscreen}
              disabled={!hasEntries(workloadPodLogsState.entries)}
            >
              <KialiIcon.Expand />
              <span className={iconStyle}>Expand</span>
            </Button>
          </Tooltip>

          <Select
            open={workloadPodLogsState.kebabOpen}
            onChange={() => setKebabOpen(workloadPodLogsState.kebabOpen)}
          >
            {kebabActions}
          </Select>
        </Toolbar>

        {workloadPodLogsState.linesTruncatedContainers.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <Alert
              title={`Max lines exceeded for containers: ${workloadPodLogsState.linesTruncatedContainers.join(
                ', ',
              )}. Increase maxLines for more lines, or decrease time period.`}
            />
          </div>
        )}

        <div
          key="logsText"
          id="logsText"
          className={logsDisplay}
          // note - for some reason the callable typescript needs to be applied as "style" and
          // not as a "className".  Otherwise the initial scroillHeight is incorrectly set
          // (to max) and when we try to assign scrollTop to scrollHeight (above),it stays at 0
          // and we fail to set the scroll correctly. So, don't change this!
          style={{
            ...logsHeight(
              workloadPodLogsState.showToolbar,
              workloadPodLogsState.fullscreen,
              workloadPodLogsState.linesTruncatedContainers.length > 0,
            ),
            ...logsBackground(hasEntries(workloadPodLogsState.entries)),
          }}
        >
          <List component="ul">
            {workloadPodLogsState.entries.length === 0 ? (
              <div className={noLogsStyle}>{NoLogsFoundMessage}</div>
            ) : (
              renderLogs()
            )}
          </List>
        </div>
      </div>
    );
  };

  const removeAccessLogModal = (k: string): void => {
    workloadPodLogsState.accessLogModals.delete(k);
    const accessLogModals = new Map<string, AccessLog>(
      workloadPodLogsState.accessLogModals,
    );
    workloadPodLogsState.accessLogModals = accessLogModals;
    console.log('remove acces');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);
  };

  const getAccessLogModals = (): React.ReactNode[] => {
    const modals: React.ReactNode[] = [];
    let i = 0;

    workloadPodLogsState.accessLogModals.forEach((v, k) => {
      modals.push(
        <AccessLogModal
          key={`alm-${i++}`}
          accessLog={v}
          accessLogMessage={k}
          onClose={() => removeAccessLogModal(k)}
        />,
      );
    });

    return modals;
  };

  const setPod = (podValue: string): void => {
    const podL = props.pods[Number(podValue)];
    const containerNames = getContainerOptions(podL);

    workloadPodLogsState.containerOptions = containerNames;
    workloadPodLogsState.podValue = Number(podValue);
    console.log('set pod');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);
  };

  const setMaxLines = (maxLines: number): void => {
    workloadPodLogsState.maxLines = maxLines;
    console.log('max lines');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);
  };

  const checkSubmitShow = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault();

      workloadPodLogsState.showClearShowLogButton = !!(
        event.target as HTMLInputElement
      ).value;
      workloadPodLogsState.showLogValue = (
        event.target as HTMLInputElement
      ).value;
      console.log('check ksubmit');
      console.log(workloadPodLogsState);
      setWorkloadPodLogsState(workloadPodLogsState);
    }
  };

  const clearShow = (): void => {
    // TODO: when TextInput refs are fixed in PF4 then use the ref and remove the direct HTMLElement usage
    // this.showInputRef.value = '';
    const htmlInputElement: HTMLInputElement = document.getElementById(
      'log_show',
    ) as HTMLInputElement;
    if (htmlInputElement !== null) {
      htmlInputElement.value = '';
    }

    workloadPodLogsState.showError = undefined;
    workloadPodLogsState.showLogValue = '';
    workloadPodLogsState.showClearShowLogButton = false;
    console.log('tclear show');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);
  };

  const checkSubmitHide = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      workloadPodLogsState.showClearHideLogButton = !!(
        event.target as HTMLInputElement
      ).value;
      workloadPodLogsState.hideLogValue = (
        event.target as HTMLInputElement
      ).value;
      console.log('check submit');
      console.log(workloadPodLogsState);
      setWorkloadPodLogsState(workloadPodLogsState);
    }
  };

  const clearHide = (): void => {
    // TODO: when TextInput refs are fixed in PF4 then use the ref and remove the direct HTMLElement usage
    // this.hideInputRef.value = '';
    const htmlInputElement: HTMLInputElement = document.getElementById(
      'log_hide',
    ) as HTMLInputElement;

    if (htmlInputElement !== null) {
      htmlInputElement.value = '';
    }

    workloadPodLogsState.hideError = undefined;
    workloadPodLogsState.hideLogValue = '';
    workloadPodLogsState.showClearHideLogButton = false;
    console.log('clear hide');
    console.log(workloadPodLogsState);
    setWorkloadPodLogsState(workloadPodLogsState);
  };

  const fetchEntries = (
    namespace: string,
    podName: string,
    containerOptions: ContainerOption[],
    showSpans: boolean,
    maxLines: number,
    timeRange: TimeRange,
    cluster?: string,
  ): void => {
    const now: TimeInMilliseconds = Date.now();
    const timeRangeDates = evalTimeRange(timeRange);
    const sinceTime: TimeInSeconds = Math.floor(
      timeRangeDates[0].getTime() / 1000,
    );
    const endTime: TimeInMilliseconds = timeRangeDates[1].getTime();

    // to save work on the server-side, only supply duration when time range is in the past
    let duration = 0;

    if (endTime < now) {
      duration = Math.floor(timeRangeDates[1].getTime() / 1000) - sinceTime;
    }

    const selectedContainers = containerOptions.filter(c => c.isSelected);
    const podPromises: Promise<PodLogs | Span[]>[] = selectedContainers.map(
      c => {
        return kialiClient.getPodLogs(
          namespace,
          podName,
          c.name,
          maxLines,
          sinceTime,
          duration,
          c.isProxy,
          cluster,
        );
      },
    );

    if (showSpans) {
      // Convert seconds to microseconds
      const params: TracingQuery = {
        endMicros: endTime * 1000,
        startMicros: sinceTime * 1000000,
      };

      podPromises.unshift(
        kialiClient.getWorkloadSpans(
          namespace,
          props.workload,
          params,
          props.cluster,
        ),
      );
    }

    promises
      .registerAll('logs', podPromises)
      .then(responses => {
        let entries = [] as Entry[];
        if (showSpans) {
          const spans = showSpans ? (responses[0] as Span[]) : ([] as Span[]);

          entries = spans.map(span => {
            const startTimeU = Math.floor(span.startTime / 1000);

            return {
              timestamp: moment(startTimeU)
                .utc()
                .format('YYYY-MM-DD HH:mm:ss.SSS'),
              timestampUnix: startTimeU,
              span: span,
            } as Entry;
          });
          responses.shift();
        }
        const linesTruncatedContainers: string[] = [];

        for (let i = 0; i < responses.length; i++) {
          const response = responses[i] as PodLogs;
          const containerLogEntries = response.entries as LogEntry[];

          if (!containerLogEntries) {
            continue;
          }

          const color = selectedContainers[i].color;
          containerLogEntries.forEach(le => {
            le.color = color;
            entries.push({
              timestamp: le.timestamp,
              timestampUnix: le.timestampUnix,
              logEntry: le,
            } as Entry);
          });

          if (response.linesTruncated) {
            // linesTruncatedContainers.push(new URL(responses[i].responseURL).searchParams.get('container')!);
          }
        }

        const sortedEntries = entries.sort((a, b) => {
          return a.timestampUnix - b.timestampUnix;
        });

        workloadPodLogsState.entries = sortedEntries;
        workloadPodLogsState.linesTruncatedContainers =
          linesTruncatedContainers;
        workloadPodLogsState.loadingLogs = false;
        console.log('logs');
        console.log(workloadPodLogsState);
        setWorkloadPodLogsState(workloadPodLogsState);

        return;
      })
      .catch(error => {
        if (error.isCanceled) {
          workloadPodLogsState.loadingLogs = false;
          console.log('logs catch');
          console.log(workloadPodLogsState);
          setWorkloadPodLogsState(workloadPodLogsState);
          return;
        }

        const errorMsg = error.response?.data?.error ?? error.message;
        const nowDate = Date.now();

        workloadPodLogsState.entries = [
          {
            timestamp: nowDate.toString(),
            timestampUnix: nowDate,
            logEntry: {
              severity: 'Error',
              timestamp: nowDate.toString(),
              timestampUnix: nowDate,
              message: `Failed to fetch workload logs: ${errorMsg}`,
            },
          },
        ];
        workloadPodLogsState.loadingLogs = false;
        console.log('loading logs');
        console.log(workloadPodLogsState);
        setWorkloadPodLogsState(workloadPodLogsState);
      });
    /*
        workloadPodLogsState.loadingLogs = false;
        workloadPodLogsState.entries = [];
        console.log("entries")
        console.log(workloadPodLogsState)
        setWorkloadPodLogsState(workloadPodLogsState); */
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      const podL = props.pods[workloadPodLogsState.podValue!];
      // Check if the config is loaded
      fetchEntries(
        props.namespace,
        podL.name,
        workloadPodLogsState.containerOptions
          ? workloadPodLogsState.containerOptions
          : [],
        workloadPodLogsState.showSpans,
        workloadPodLogsState.maxLines,
        props.timeRange,
        props.cluster,
      );
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  // @ts-ignore
  const maxLines = MaxLinesOptions[workloadPodLogsState.maxLines];

  // @ts-ignore
  return (
    <>
      <RenderComponentScroll>
        <>
          {workloadPodLogsState.containerOptions && (
            <Grid key="logs" id="logs" style={{ height: '100%' }}>
              <Grid xs={12}>
                <Card>
                  <CardContent>
                    {workloadPodLogsState.showToolbar && (
                      <Toolbar style={{ padding: 0, width: '100%' }}>
                        <div style={{ display: 'inline' }}>
                          <PFBadge
                            badge={PFBadges.Pod}
                            position="top"
                            style={{ marginTop: '30%' }}
                          />
                        </div>
                        <ToolbarDropdown
                          id="wpl_pods"
                          tooltip="Display logs for the selected pod"
                          handleSelect={(key: string) => setPod(key)}
                          value={workloadPodLogsState.podValue}
                          label={
                            props.pods[workloadPodLogsState.podValue!]?.name
                          }
                          options={podOptions!}
                        />
                        <Input
                          id="log_show"
                          name="log_show"
                          style={{ width: '10em' }}
                          autoComplete="on"
                          type="text"
                          onKeyDown={checkSubmitShow}
                          defaultValue={workloadPodLogsState.showLogValue}
                          aria-label="show log text"
                          placeholder="Show..."
                        />

                        {workloadPodLogsState.showClearShowLogButton && (
                          <Tooltip
                            key="clear_show_log"
                            title="Clear Show Log Entries..."
                          >
                            <Button onClick={clearShow}>
                              <KialiIcon.Close />
                            </Button>
                          </Tooltip>
                        )}

                        <Input
                          id="log_hide"
                          name="log_hide"
                          style={{ width: '10em' }}
                          autoComplete="on"
                          type="text"
                          onKeyDown={checkSubmitHide}
                          defaultValue={workloadPodLogsState.hideLogValue}
                          aria-label="hide log text"
                          placeholder="Hide..."
                        />

                        {workloadPodLogsState.showClearHideLogButton && (
                          <Tooltip
                            key="clear_hide_log"
                            title="Clear Hide Log Entries..."
                          >
                            <Button onClick={clearHide}>
                              <KialiIcon.Close />
                            </Button>
                          </Tooltip>
                        )}

                        {workloadPodLogsState.showError && (
                          <div style={{ color: 'red' }}>
                            {workloadPodLogsState.showError}
                          </div>
                        )}
                        {workloadPodLogsState.hideError && (
                          <div style={{ color: 'red' }}>
                            {workloadPodLogsState.hideError}
                          </div>
                        )}

                        <div style={{ display: 'inline' }}>
                          <Tooltip
                            key="show_hide_log_help"
                            title="Show only, or Hide all, matching log entries. Match by case-sensitive substring (default) or regular expression (as set in the kebab menu)."
                          >
                            <div>
                              <KialiIcon.Info className={infoIcons} />
                            </div>
                          </Tooltip>
                        </div>

                        <FormControlLabel
                          control={
                            <Checkbox
                              id="log-spans"
                              className={checkboxStyle}
                              checked={workloadPodLogsState.showSpans}
                              onChange={(_event, checked) =>
                                toggleSpans(checked)
                              }
                            />
                          }
                          label={
                            <span
                              style={{
                                color: spanColor,
                                fontWeight: 'bold',
                              }}
                            >
                              spans
                            </span>
                          }
                        />
                        <ToolbarDropdown
                          id="wpl_maxLines"
                          handleSelect={(key: any) => setMaxLines(Number(key))}
                          value={workloadPodLogsState.maxLines}
                          label={maxLines}
                          options={MaxLinesOptions}
                          tooltip="Truncate after N log lines"
                          className={toolbarTail}
                        />
                      </Toolbar>
                    )}
                    {getLogsDiv()}
                    {getAccessLogModals()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          {workloadPodLogsState.loadingLogsError && (
            <div>{workloadPodLogsState.loadingLogsError}</div>
          )}
        </>
      </RenderComponentScroll>
    </>
  );
};
