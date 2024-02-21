import * as React from 'react';
import * as Cy from 'cytoscape';
import { Button, ButtonVariant, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { style } from 'typestyle';
import { KialiAppState } from '../../store/Store';
import { PFColors } from '../Pf/PfColors';
import * as CytoscapeGraphUtils from './CytoscapeGraphUtils';
import { EdgeMode, Layout } from '../../types/Graph';
import { GraphActions } from '../../actions/GraphActions';
import { HistoryManager, URLParam } from '../../app/History';
import * as LayoutDictionary from './graphs/LayoutDictionary';
import { GraphToolbarActions } from '../../actions/GraphToolbarActions';
import { GraphTourStops } from '../../pages/Graph/GraphHelpTour';
import { TourStop } from '../Tour/TourStop';
import { KialiDagreGraph } from './graphs/KialiDagreGraph';
import { KialiGridGraph } from './graphs/KialiGridGraph';
import { KialiConcentricGraph } from './graphs/KialiConcentricGraph';
import { KialiBreadthFirstGraph } from './graphs/KialiBreadthFirstGraph';
import { KialiIcon } from '../../config/KialiIcon';
import { KialiContext } from '../../store';

type CytoscapeToolbarProps =  {
    cytoscapeGraphRef: any;
    disabled: boolean;
};

type CytoscapeToolbarState = {
  allowGrab: boolean;
};

const activeButtonStyle = style({
  color: PFColors.Active
});

const buttonStyle = style({
  backgroundColor: PFColors.BackgroundColor100,
  margin: '0.125rem 0.25rem',
  padding: '0.25rem 0.5rem'
});

const cyToolbarStyle = style({
  width: '1.25rem'
});

export class CytoscapeToolbar extends React.PureComponent<CytoscapeToolbarProps, CytoscapeToolbarState> {
  kialiState = React.useContext(KialiContext) as KialiAppState;
  constructor(props: CytoscapeToolbarProps) {
    super(props);

    // Let URL override current redux state at construction time. Update URL with unset params.
    const urlLayout = HistoryManager.getParam(URLParam.GRAPH_LAYOUT);

    if (urlLayout) {
      if (urlLayout !== this.kialiState.graph.layout.name) {
        this.kialiState.dispatch.graphDispatch(GraphActions.setLayout(LayoutDictionary.getLayoutByName(urlLayout)))
      }
    } else {
      HistoryManager.setParam(URLParam.GRAPH_LAYOUT, this.kialiState.graph.layout.name);
    }

    const urlNamespaceLayout = HistoryManager.getParam(URLParam.GRAPH_NAMESPACE_LAYOUT);

    if (urlNamespaceLayout) {
      if (urlNamespaceLayout !== this.kialiState.graph.namespaceLayout.name) {
        this.kialiState.dispatch.graphDispatch(GraphActions.setNamespaceLayout(LayoutDictionary.getLayoutByName(urlNamespaceLayout)))
      }
    } else {
      HistoryManager.setParam(URLParam.GRAPH_NAMESPACE_LAYOUT, this.kialiState.graph.namespaceLayout.name);
    }

    this.state = { allowGrab: false };
  }

  componentDidMount(): void {
    // Toggle drag once when component is initialized
    this.toggleDrag();
  }

  componentDidUpdate(): void {
    // ensure redux state and URL are aligned
    HistoryManager.setParam(URLParam.GRAPH_LAYOUT, this.kialiState.graph.layout.name);
    HistoryManager.setParam(URLParam.GRAPH_NAMESPACE_LAYOUT, this.kialiState.graph.namespaceLayout.name);
  }

  render(): React.ReactNode {
    return (
      <div className={cyToolbarStyle}>
        <div>
          <Tooltip content={this.state.allowGrab ? 'Disable Drag' : 'Enable Drag'} position={TooltipPosition.right}>
            <Button
              id="toolbar_grab"
              aria-label="Toggle Drag"
              isActive={this.state.allowGrab}
              onClick={() => this.toggleDrag()}
              className={buttonStyle}
              variant={ButtonVariant.plain}
            >
              <KialiIcon.DragDrop className={this.state.allowGrab ? activeButtonStyle : undefined} />
            </Button>
          </Tooltip>
        </div>

        <div>
          <Tooltip content="Zoom to Fit" position={TooltipPosition.right}>
            <Button
              id="toolbar_graph_fit"
              aria-label="Zoom to Fit"
              onClick={() => this.fit()}
              className={buttonStyle}
              variant={ButtonVariant.plain}
            >
              <KialiIcon.ExpandArrows />
            </Button>
          </Tooltip>
        </div>

        <div>
          <Tooltip content="Hide healthy edges" position={TooltipPosition.right}>
            <Button
              id="toolbar_edge_mode_unhealthy"
              aria-label="Hide Healthy Edges"
              isActive={this.kialiState.graph.edgeMode === EdgeMode.UNHEALTHY}
              onClick={() => {
                this.handleEdgeModeClick(EdgeMode.UNHEALTHY);
              }}
              className={buttonStyle}
              variant={ButtonVariant.plain}
            >
              <KialiIcon.LongArrowRight
                className={this.kialiState.graph.edgeMode === EdgeMode.UNHEALTHY ? activeButtonStyle : undefined}
              />
            </Button>
          </Tooltip>
        </div>

        <div>
          <Tooltip content="Hide all edges" position={TooltipPosition.right}>
            <Button
              id="toolbar_edge_mode_none"
              aria-label="Hide All Edges"
              isActive={this.kialiState.graph.edgeMode === EdgeMode.NONE}
              onClick={() => {
                this.handleEdgeModeClick(EdgeMode.NONE);
              }}
              className={buttonStyle}
              variant={ButtonVariant.plain}
            >
              <KialiIcon.LongArrowRight
                className={this.kialiState.graph.edgeMode === EdgeMode.NONE ? activeButtonStyle : undefined}
              />
            </Button>
          </Tooltip>
        </div>

        <div>
          <Tooltip content={`Layout default ${KialiDagreGraph.getLayout().name}`} position={TooltipPosition.right}>
            <Button
              id="toolbar_layout_default"
              aria-label="Graph Layout Default Style"
              isActive={this.kialiState.graph.layout.name === KialiDagreGraph.getLayout().name}
              isDisabled={this.props.disabled}
              onClick={() => {
                this.setLayout(KialiDagreGraph.getLayout());
              }}
              className={buttonStyle}
              variant={ButtonVariant.plain}
            >
              <KialiIcon.Topology
                className={this.kialiState.graph.layout.name === KialiDagreGraph.getLayout().name ? activeButtonStyle : undefined}
              />
            </Button>
          </Tooltip>
        </div>

        <TourStop info={GraphTourStops.Layout}>
          <div>
            <Tooltip content={`Layout 1 ${KialiGridGraph.getLayout().name}`} position={TooltipPosition.right}>
              <Button
                id="toolbar_layout1"
                aria-label="Graph Layout Style 1"
                isActive={this.kialiState.graph.layout.name === KialiGridGraph.getLayout().name}
                isDisabled={this.props.disabled}
                onClick={() => {
                  this.setLayout(KialiGridGraph.getLayout());
                }}
                className={buttonStyle}
                variant={ButtonVariant.plain}
              >
                <KialiIcon.Topology
                  className={this.kialiState.graph.layout.name === KialiGridGraph.getLayout().name ? activeButtonStyle : undefined}
                />
              </Button>
            </Tooltip>
          </div>
        </TourStop>

        <div>
          <Tooltip content={`Layout 2 ${KialiConcentricGraph.getLayout().name}`} position={TooltipPosition.right}>
            <Button
              id="toolbar_layout2"
              aria-label="Graph Layout Style 2"
              isActive={this.kialiState.graph.layout.name === KialiConcentricGraph.getLayout().name}
              isDisabled={this.props.disabled}
              onClick={() => {
                this.setLayout(KialiConcentricGraph.getLayout());
              }}
              className={buttonStyle}
              variant={ButtonVariant.plain}
            >
              <KialiIcon.Topology
                className={
                  this.kialiState.graph.layout.name === KialiConcentricGraph.getLayout().name ? activeButtonStyle : undefined
                }
              />
            </Button>
          </Tooltip>
        </div>

        <div>
          <Tooltip content={`Layout 3 ${KialiBreadthFirstGraph.getLayout().name}`} position={TooltipPosition.right}>
            <Button
              id="toolbar_layout3"
              aria-label="Graph Layout Style 3"
              isActive={this.kialiState.graph.layout.name === KialiBreadthFirstGraph.getLayout().name}
              isDisabled={this.props.disabled}
              onClick={() => {
                this.setLayout(KialiBreadthFirstGraph.getLayout());
              }}
              className={buttonStyle}
              variant={ButtonVariant.plain}
            >
              <KialiIcon.Topology
                className={
                  this.kialiState.graph.layout.name === KialiBreadthFirstGraph.getLayout().name ? activeButtonStyle : undefined
                }
              />
            </Button>
          </Tooltip>
        </div>

        {this.kialiState.graph.toolbarState.boxByNamespace && (
          <div>
            <Tooltip
              content={`Namespace Layout 1 ${KialiDagreGraph.getLayout().name}`}
              position={TooltipPosition.right}
            >
              <Button
                id="toolbar_namespace_layout1"
                aria-label="Namespace Layout Style 1"
                isActive={this.kialiState.graph.namespaceLayout.name === KialiDagreGraph.getLayout().name}
                isDisabled={this.props.disabled}
                onClick={() => {
                  this.setNamespaceLayout(KialiDagreGraph.getLayout());
                }}
                className={buttonStyle}
                variant={ButtonVariant.plain}
              >
                <KialiIcon.Tenant
                  className={
                    this.kialiState.graph.namespaceLayout.name === KialiDagreGraph.getLayout().name ? activeButtonStyle : undefined
                  }
                />
              </Button>
            </Tooltip>
          </div>
        )}

        {this.kialiState.graph.toolbarState.boxByNamespace && (
          <div>
            <Tooltip
              content={`Namespace Layout 2 ${KialiBreadthFirstGraph.getLayout().name}`}
              position={TooltipPosition.right}
            >
              <Button
                id="toolbar_namespace_layout2"
                aria-label="Namespace Layout Style 2"
                isActive={this.kialiState.graph.namespaceLayout.name === KialiBreadthFirstGraph.getLayout().name}
                isDisabled={this.props.disabled}
                onClick={() => {
                  this.setNamespaceLayout(KialiBreadthFirstGraph.getLayout());
                }}
                className={buttonStyle}
                variant={ButtonVariant.plain}
              >
                <KialiIcon.Tenant
                  className={
                    this.kialiState.graph.namespaceLayout.name === KialiBreadthFirstGraph.getLayout().name
                      ? activeButtonStyle
                      : undefined
                  }
                />
              </Button>
            </Tooltip>
          </div>
        )}

        <TourStop info={GraphTourStops.Legend}>
          <div>
            <Tooltip content="Show Legend" position={TooltipPosition.right}>
              <Button
                id="toolbar_toggle_legend"
                aria-label="Show Legend"
                isActive={this.kialiState.graph.toolbarState.showLegend}
                onClick={() => this.kialiState.dispatch.graphDispatch(GraphToolbarActions.toggleLegend)}
                className={buttonStyle}
                variant={ButtonVariant.plain}
              >
                <KialiIcon.Map className={this.kialiState.graph.toolbarState.showLegend ? activeButtonStyle : undefined} size="sm" />
              </Button>
            </Tooltip>
          </div>
        </TourStop>
      </div>
    );
  }

  private getCy = (): Cy.Core | null => {
    if (this.props.cytoscapeGraphRef.current) {
      return this.props.cytoscapeGraphRef.current.getCy();
    }

    return null;
  };

  private toggleDrag = (): void => {
    const cy = this.getCy();

    if (!cy) {
      return;
    }

    cy.autoungrabify(this.state.allowGrab);
    this.setState({ allowGrab: !this.state.allowGrab });
  };

  private fit = (): void => {
    const cy = this.getCy();

    if (cy) {
      CytoscapeGraphUtils.safeFit(cy);
    }
  };

  private handleEdgeModeClick = (edgeMode: EdgeMode): void => {
    this.kialiState.dispatch.graphDispatch(GraphActions.setEdgeMode(edgeMode === this.kialiState.graph.edgeMode ? EdgeMode.ALL : edgeMode))
  };

  private setLayout = (layout: Layout): void => {
    if (layout.name !== this.kialiState.graph.layout.name) {
      this.kialiState.dispatch.graphDispatch(GraphActions.setLayout(layout))
    }
  };

  private setNamespaceLayout = (layout: Layout): void => {
    if (layout.name !== this.kialiState.graph.namespaceLayout.name) {
      this.kialiState.dispatch.graphDispatch(GraphActions.setNamespaceLayout(layout))
    }
  };
}
