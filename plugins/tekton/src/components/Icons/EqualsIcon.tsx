import * as React from 'react';

import { global_palette_gold_400 as mediumColor } from '@patternfly/react-tokens/dist/js/global_palette_gold_400';

const EqualsIcon = ({
  className,
  title,
}: {
  className: string;
  title?: string;
}): React.ReactElement => {
  return (
    <svg
      viewBox="0 -960 960 960"
      fill={mediumColor.value}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {title && <title>{title}</title>}
      <path d="M160-280v-120h640v120H160Zm0-280v-120h640v120H160Z" />
    </svg>
  );
};

export default EqualsIcon;
