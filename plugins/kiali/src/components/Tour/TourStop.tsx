import * as React from 'react';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';
import ReactResizeDetector from 'react-resize-detector';
import { KialiIcon } from '../../config/KialiIcon';
import { TourActions } from '../../actions/TourActions';
import { PFColors } from '../Pf/PfColors';
import { style } from 'typestyle';
import { KialiAppState, KialiContext } from '../../store';

export interface TourStopInfo {
  description?: string; // displayed as the tour stop body
  distance?: number; // distance from target, default=25
  isValid?: boolean; // internal use, leave unset
  htmlDescription?: React.ReactNode;
  name: string; // displayed in the tour stop header.
  position?: PopoverPosition;
}

export interface TourInfo {
  name: string;
  stops: Array<TourStopInfo>;
}

const stopNumberStyle = style({
  borderRadius: '20px',
  backgroundColor: PFColors.Blue300,
  padding: '2px 6px',
  marginRight: '10px',
  color: PFColors.White
});

type TourStopProps = {
  children?: React.ReactNode;
  info: TourStopInfo | TourStopInfo[];
};

export function getNextTourStop(
  activeTour: TourInfo,
  activeStop: number,
  direction: 'back' | 'forward'
): number | undefined {
  if (direction === 'back') {
    for (let i: number = activeStop - 1; i >= 0; --i) {
      if (activeTour.stops[i].isValid) {
        return i;
      }
    }
  } else {
    for (let i: number = activeStop + 1; i < activeTour.stops.length; ++i) {
      if (activeTour.stops[i].isValid) {
        return i;
      }
    }
  }
  return undefined;
}

export class TourStop extends React.PureComponent<TourStopProps> {
  tourStopInfo: TourStopInfo[];
  kialiState = React.useContext(KialiContext) as KialiAppState;

  constructor(props: TourStopProps) {
    super(props);

    this.tourStopInfo = Array.isArray(props.info) ? props.info : [props.info];
  }

  private getStop = (direction: 'back' | 'forward'): number | undefined => {
    if (this.kialiState.tourState.activeStop === undefined) {
      return undefined;
    }

    return getNextTourStop(this.kialiState.tourState.activeTour!, this.kialiState.tourState.activeStop!, direction);
  };

  private setStop = (stop: number) => {
    this.kialiState.dispatch.tourDispatch(TourActions.setStop(stop));
  };

  private backButton = () => {
    const stop = this.getStop('back');
    return (
      <Button isDisabled={stop === undefined} variant={ButtonVariant.secondary} onClick={() => this.setStop(stop!)}>
        <KialiIcon.AngleLeft /> Back
      </Button>
    );
  };

  private nextButton = () => {
    const right = style({
      float: 'right'
    });
    const stop = this.getStop('forward');
    
    if (stop === undefined) {
      return (
        <Button className={right} variant={ButtonVariant.primary} onClick={() => this.kialiState.dispatch.tourDispatch(TourActions.endTour)}>
          Done
        </Button>
      );
    }

    return (
      <Button className={right} variant={ButtonVariant.primary} onClick={() => this.setStop(stop!)}>
        Next <KialiIcon.AngleRight />
      </Button>
    );
  };

  private activeInfo = (): TourStopInfo | undefined => {
    for (const tsi of this.tourStopInfo) {
      const name = tsi.name;
      const isActive =
      this.kialiState.tourState.activeTour !== undefined && name === this.kialiState.tourState.activeTour.stops[this.kialiState.tourState.activeStop!].name;
      if (isActive) {
        return tsi;
      }
    }
    return undefined;
  };

  // This is here to workaround what seems to be a bug.  As far as I know when isVisible is set then outside clicks should not hide
  // the Popover, but it seems to be happening in certain scenarios. So, if the Popover is still valid, unhide it immediately.
  private onHidden = () => {
    if (this.activeInfo()) {
      this.forceUpdate();
    }
  };

  private onResize = () => {
    if (this.activeInfo()) {
      this.forceUpdate();
    }
  };

  private shouldClose = () => {
    this.kialiState.dispatch.tourDispatch(TourActions.endTour)
  };

  componentDidMount() {
    this.tourStopInfo.forEach(ti => (ti.isValid = true));
  }

  componentWillUnmount() {
    this.tourStopInfo.forEach(ti => (ti.isValid = false));
  }

  render() {
    const info = this.activeInfo();
    const offset = info && info.distance ? info.distance : 25;
    const children = this.props.children;

    return (
      <>
        {info ? (
          <>
            <ReactResizeDetector
              refreshMode={'debounce'}
              refreshRate={100}
              skipOnMount={true}
              handleWidth={true}
              handleHeight={true}
              onResize={this.onResize}
            />
            <Popover
              bodyContent={info.description ? info.description : info.htmlDescription}
              distance={offset}
              footerContent={
                <div>
                  {this.backButton()}
                  {this.nextButton()}
                </div>
              }
              headerContent={
                <div>
                  <span className={stopNumberStyle}>{this.kialiState.tourState.activeStop! + 1}</span>
                  <span>{info.name}</span>
                </div>
              }
              isVisible={true}
              onHidden={this.onHidden}
              position={info.position}
              shouldClose={(_event, _) => this.shouldClose()}
            >
              <>{children}</>
            </Popover>
          </>
        ) : (
          <>{children}</>
        )}
      </>
    );
  }
}
