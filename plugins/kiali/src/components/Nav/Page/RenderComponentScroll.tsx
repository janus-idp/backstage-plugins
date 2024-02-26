import React from 'react';

import { classes } from 'typestyle';

import { kialiStyle } from '../../../styles/StyleUtils';

// TOP_PADDING constant is used to adjust the height of the main div to allow scrolling in the inner container layer.
const TOP_PADDING = 76 + 440;

/**
 * By default, Kiali hides the global scrollbar and fixes the height for some pages to force the scrollbar to appear
 * Hiding global scrollbar is not possible when Kiali is embedded in other application (like Openshift Console)
 * In these cases height is not fixed to avoid multiple scrollbars (https://github.com/kiali/kiali/issues/6601)
 * GLOBAL_SCROLLBAR environment variable is not defined in standalone Kiali application (value is always false)
 */
const globalScrollbar = process.env.GLOBAL_SCROLLBAR ?? 'false';

const componentStyle = kialiStyle({
  padding: '20px',
});

interface Props {
  className?: any;
  onResize?: (height: number) => void;
  children: React.ReactElement;
}

interface State {
  height: number;
}

export class RenderComponentScroll extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { height: 0 };
  }

  componentDidMount() {
    this.updateWindowDimensions();
    // @ts-ignore
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    // @ts-ignore
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    const topPadding = TOP_PADDING;

    this.setState(
      {
        // @ts-ignore
        height: window.innerHeight - topPadding,
      },
      () => {
        if (this.props.onResize) {
          this.props.onResize(this.state.height);
        }
      },
    );
  };

  render() {
    let scrollStyle = {};

    // If there is no global scrollbar, height is fixed to force the scrollbar to appear in the component
    if (globalScrollbar === 'false') {
      scrollStyle = { height: this.state.height, overflowY: 'auto' };
    }

    return (
      <div
        style={scrollStyle}
        className={classes(componentStyle, this.props.className)}
      >
        {this.props.children}
      </div>
    );
  }
}
