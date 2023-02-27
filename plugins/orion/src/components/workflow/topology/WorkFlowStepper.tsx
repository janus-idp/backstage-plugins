import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { PipelineLayout } from './PipelineLayout';

import './TopologyComponent.css';

export const WorkFlowStepper = () => {
  return (
    <div className="pf-ri__topology-demo">
      <PipelineLayout />
    </div>
  );
};

// export const WorkFlowStepper = () => {
//   return (
//       <ParodosPage>
//           <ContentHeader title="Onboarding">
//               <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
//           </ContentHeader>
//           <Typography paragraph>
//               You are onboarding: org-name/new-project
//           </Typography>
//           <TopologyContentBody/>
//           <WorkFlowLogViewer/>
//       </ParodosPage>
//   );
// };
