import { Decorator as PfDecorator } from '@patternfly/react-topology';
import * as React from 'react';
import { Link } from 'react-router-dom';

import './Decorator.css';

type DecoratorTypes = {
  x: number;
  y: number;
  radius: number;
  onClick?(event: React.MouseEvent<SVGGElement, MouseEvent>): void;
  href?: string;
  ariaLabel?: string;
  external?: boolean;
  circleRef?: React.Ref<SVGCircleElement>;
};

const Decorator = ({
  x,
  y,
  radius,
  href,
  ariaLabel,
  external,
  ...rest
}: DecoratorTypes) => {
  const decorator = (
    <PfDecorator
      x={x}
      y={y}
      radius={radius}
      className="tp-decorator"
      showBackground
      {...rest}
    />
  );

  if (href) {
    return external ? (
      <a
        className="tp-decorator__link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => {
          e.stopPropagation();
        }}
        role="button"
        aria-label={ariaLabel}
      >
        {decorator}
      </a>
    ) : (
      <Link
        className="tp-decorator__link"
        to={href}
        role="button"
        aria-label={ariaLabel}
      >
        {decorator}
      </Link>
    );
  }
  return decorator;
};

export default Decorator;
