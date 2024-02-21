import * as React from 'react';
import { Link } from 'react-router-dom';
import { style } from 'typestyle';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { history } from '../../../app/History';
import { BoxByType, DecoratedGraphNodeData, NodeType } from '../../../types/Graph';
import { TracingInfo } from '../../../types/TracingInfo';
import { KialiAppState } from '../../../store/Store';
import { isMultiCluster, Paths, serverConfig } from '../../../config';
import { NodeContextMenuProps } from '../CytoscapeContextMenu';
import { getTitle } from '../../../pages/Graph/SummaryPanelCommon';
import { PFBadge, PFBadges } from '../../Pf/PfBadges';
import { renderBadgedName } from '../../../pages/Graph/SummaryLink';
import { PFColors } from '../../Pf/PfColors';
import { useServiceDetailForGraphNode } from '../../../hooks/services';
import { getServiceDetailsUpdateLabel, hasServiceDetailsTrafficRouting } from '../../../types/ServiceInfo';
import { KialiContext } from '../../../store';

// Note, in the below styles we assign colors to be consistent with PF Dropdown
const contextMenu = style({
  fontSize: 'var(--graph-side-panel--font-size)',
  textAlign: 'left'
});

const contextMenuHeader = style({
  fontSize: 'var(--graph-side-panel--font-size)',
  marginBottom: '3px',
  textAlign: 'left'
});

const contextMenuSubTitle = style({
  color: PFColors.Color200,
  fontWeight: 700,
  paddingTop: 2,
  paddingBottom: 4
});

const contextMenuItem = style({
  textDecoration: 'none',
  $nest: {
    '&:hover': {
      backgroundColor: PFColors.BackgroundColor200,
      color: PFColors.Link
    }
  }
});

const contextMenuItemLink = style({
  color: PFColors.Color100
});

const hrStyle = style({
  border: 0,
  borderTop: `1px solid ${PFColors.BorderColor100}`,
  margin: '8px 0 5px 0'
});

type LinkParams = { namespace: string; type: string; name: string; cluster?: string };

function getLinkParamsForNode(node: DecoratedGraphNodeData): LinkParams | undefined {
  let cluster = node.cluster;
  const namespace: string = node.isServiceEntry ? node.isServiceEntry.namespace : node.namespace;
  let name: string | undefined = undefined;
  let type: string | undefined = undefined;
  switch (node.nodeType) {
    case NodeType.APP:
    case NodeType.BOX:
      // only app boxes have full context menus
      const isBox = node.isBox;
      if (!isBox || isBox === BoxByType.APP) {
        // Prefer workload links
        if (node.workload && node.parent) {
          name = node.workload;
          type = Paths.WORKLOADS;
        } else {
          type = Paths.APPLICATIONS;
          name = node.app;
        }
      }
      break;
    case NodeType.SERVICE:
      type = node.isServiceEntry ? Paths.SERVICEENTRIES : Paths.SERVICES;
      name = node.service;
      break;
    case NodeType.WORKLOAD:
      name = node.workload;
      type = Paths.WORKLOADS;
      break;
  }

  return type && name ? { namespace, type, name, cluster } : undefined;
}

export const NodeContextMenu = (props: NodeContextMenuProps) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [serviceDetails, gateways, peerAuthentications, isServiceDetailsLoading] = useServiceDetailForGraphNode(
    props,
    true,
    kialiState.userSettings.duration,
    kialiState.graph.updateTime
  );
  const updateLabel = getServiceDetailsUpdateLabel(serviceDetails);

  // TODO: Deduplicate
  function getDropdownItemTooltipMessage(): string {
    if (serverConfig.deployment.viewOnlyMode) {
      return 'User does not have permission';
    } else if (hasServiceDetailsTrafficRouting(serviceDetails)) {
      return 'Traffic routing already exists for this service';
    } else {
      return "Traffic routing doesn't exists for this service";
    }
  }

  function createMenuItem(href: string, title: string, target: string = '_self', external: boolean = false) {
    const commonLinkProps = {
      className: contextMenuItemLink,
      children: title,
      onClick: onClick,
      target
    };
    let item: any;
    if (external) {
      item = (
        <a href={href} rel="noreferrer noopener" {...commonLinkProps}>
          {commonLinkProps.children} <ExternalLinkAltIcon />
        </a>
      );
    } else {
      // Kiosk actions are used when the kiosk specifies a parent,
      // otherwise the kiosk=true will keep the links inside Kiali
      item = <Link to={href} {...commonLinkProps} />;      
    }

    return (
      <div key={title} className={contextMenuItem}>
        {item}
      </div>
    );
  }

  function onClick(_e: React.MouseEvent<HTMLAnchorElement>) {
    props.contextMenu.hide(0);
  }

  function renderHeader() {
    return (
      <>
        {props.isBox ? getTitle(props.isBox) : getTitle(props.nodeType)}
        {(!props.isBox || props.isBox === BoxByType.APP) && (
          <div className={contextMenuHeader}>
            <PFBadge badge={PFBadges.Namespace} size="sm" />
            {props.namespace}
          </div>
        )}
        {renderBadgedName(props)}
      </>
    );
  }

  function renderFullContextMenu(linkParams: LinkParams) {
    // The getOptionsFromLinkParams function can potentially return a blank list if the
    // node associated to the context menu is for a remote cluster with no accessible Kialis.
    // That would lead to an empty menu. Here, we assume that whoever is the host/parent component,
    // that component won't render this context menu in case this menu would be blank. So, here
    // it's simply assumed that the context menu will look good.
    const options: ContextMenuOption[] = getOptionsFromLinkParams(linkParams, kialiState.tracingState.info);
    const menuOptions = (
      <>
        <div className={contextMenuSubTitle}>Show</div>
        {options.map(o => createMenuItem(o.url, o.text, o.target, o.external))}
      </>
    );

    return (
      <div className={contextMenu} data-test="graph-node-context-menu">
        {renderHeader()}
        <hr className={hrStyle} />
        {menuOptions}
      </div>
    );
  }

  // render()
  if (props.isHover) {
    return <div className={contextMenu}>{renderHeader()}</div>;
  }

  const linkParams = getLinkParamsForNode(props);

  // Disable context menu if we are dealing with an aggregate (currently has no detail) or an inaccessible node
  if (!linkParams || props.isInaccessible) {
    props.contextMenu.disable();
    return null;
  }

  return renderFullContextMenu(linkParams);
}

const getTracingURL = (namespace: string, namespaceSelector: boolean, tracingURL: string, name?: string): string => {
  return `${tracingURL}/search?service=${name}${namespaceSelector ? `.${namespace}` : ''}`;
};

export type ContextMenuOption = {
  text: string;
  url: string;
  external?: boolean;
  target?: string;
};

export const clickHandler = (o: ContextMenuOption) => {
  if (o.external) {
    window.open(o.url, o.target);
  } else {   
    history.push(o.url);    
  }
};

export const getOptions = (node: DecoratedGraphNodeData, tracingInfo?: TracingInfo): ContextMenuOption[] => {
  const linkParams = getLinkParamsForNode(node);
  if (!linkParams) {
    return [];
  }
  return getOptionsFromLinkParams(linkParams, tracingInfo);
};

const getOptionsFromLinkParams = (linkParams: LinkParams, tracingInfo?: TracingInfo): ContextMenuOption[] => {
  let options: ContextMenuOption[] = [];
  const { namespace, type, name, cluster } = linkParams;
  let detailsPageUrl = `/namespaces/${namespace}/${type}/${name}`;
  let concat = '?';
  if (cluster && isMultiCluster) {
    detailsPageUrl += '?clusterName=' + cluster;
    concat = '&';
  }

  options.push({ text: 'Details', url: detailsPageUrl });
  if (type !== Paths.SERVICEENTRIES) {
    options.push({ text: 'Traffic', url: `${detailsPageUrl}${concat}tab=traffic` });
    if (type === Paths.WORKLOADS) {
      options.push({ text: 'Logs', url: `${detailsPageUrl}${concat}tab=logs` });
    }
    options.push({
      text: 'Inbound Metrics',
      url: `${detailsPageUrl}${concat}tab=${type === Paths.SERVICES ? 'metrics' : 'in_metrics'}`
    });
    if (type !== Paths.SERVICES) {
      options.push({ text: 'Outbound Metrics', url: `${detailsPageUrl}${concat}tab=out_metrics` });
    }
    if (type === Paths.APPLICATIONS && tracingInfo && tracingInfo.enabled) {
      if (tracingInfo.integration) {
        options.push({ text: 'Traces', url: `${detailsPageUrl}${concat}tab=traces` });
      } else if (tracingInfo.url) {
        options.push({
          text: 'Show Traces',
          url: getTracingURL(namespace, tracingInfo.namespaceSelector, tracingInfo.url, name),
          external: true,
          target: '_blank'
        });
      }
    }
  }

  return options;
};