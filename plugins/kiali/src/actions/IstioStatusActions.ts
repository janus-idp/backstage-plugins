import { ActionType, createStandardAction } from 'typesafe-actions';

import { ComponentStatus } from '../types/IstioStatus';
import { ActionKeys } from './ActionKeys';

export const IstioStatusActions = {
  setinfo: createStandardAction(ActionKeys.ISTIO_STATUS_SET_INFO)<
    ComponentStatus[]
  >(),
};

export type IstioStatusAction = ActionType<typeof IstioStatusActions>;
