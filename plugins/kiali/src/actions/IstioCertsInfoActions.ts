import { ActionType, createStandardAction } from 'typesafe-actions';

import { CertsInfo } from '../types/CertsInfo';
import { ActionKeys } from './ActionKeys';

export const IstioCertsInfoActions = {
  setinfo: createStandardAction(ActionKeys.ISTIO_SET_CERTS_INFO)<CertsInfo[]>(),
};

export type IstioCertsInfoAction = ActionType<typeof IstioCertsInfoActions>;
