import { getType } from 'typesafe-actions';

import { IstioCertsInfoActions } from '../actions/IstioCertsInfoActions';
import { KialiAppAction } from '../actions/KialiAppAction';
import { CertsInfo } from '../types/CertsInfo';

export const INITIAL_ISTIO_CERTS_INFO_STATE: CertsInfo[] = [];

export const IstioCertsInfoStateReducer = (
  state: CertsInfo[] = INITIAL_ISTIO_CERTS_INFO_STATE,
  action: KialiAppAction,
): CertsInfo[] => {
  switch (action.type) {
    case getType(IstioCertsInfoActions.setinfo):
      return action.payload;
    default:
      return state;
  }
};
