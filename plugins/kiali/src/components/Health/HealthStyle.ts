import { kialiStyle } from '../../styles/StyleUtils';
import { PFColors } from '../Pf/PfColors';

export const healthIndicatorStyle = kialiStyle({
  $nest: {
    '& .pf-v5-c-tooltip__content': {
      borderWidth: '1px',
      textAlign: 'left',
    },

    '& .pf-v5-c-content ul': {
      marginBottom: 'var(--pf-v5-c-content--ul--MarginTop)',
      marginTop: 0,
      color: PFColors.Color100,
    },
  },
});
