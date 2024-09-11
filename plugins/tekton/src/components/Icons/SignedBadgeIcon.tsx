import React from 'react';

import { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';

const SignedBadgeIcon: React.FC<SVGIconProps> = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.9 15.1L16.6 9.39998L15.55 8.37498L10.975 12.95L8.45 10.425L7.35 11.525L10.9 15.1ZM12 21.975C9.66667 21.3916 7.75 20.0375 6.25 17.9125C4.75 15.7875 4 13.4583 4 10.925V4.97498L12 1.97498L20 4.97498V10.925C20 13.4583 19.25 15.7875 17.75 17.9125C16.25 20.0375 14.3333 21.3916 12 21.975Z"
        fill="#757575"
      />
    </svg>
  );
};

export default SignedBadgeIcon;
