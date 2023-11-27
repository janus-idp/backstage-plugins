import { getType } from 'typesafe-actions';

import { IstioStatusActions } from '../actions/IstioStatusActions';
import { KialiAppAction } from '../actions/KialiAppAction';
import { ComponentStatus } from '../types/IstioStatus';

export const INITIAL_ISTIO_STATUS_STATE: ComponentStatus[] = [];

// This Reducer allows changes to the 'graphDataState' portion of Redux Store
export const IstioStatusStateReducer = (
  state: ComponentStatus[] = INITIAL_ISTIO_STATUS_STATE,
  action: KialiAppAction,
): ComponentStatus[] => {
  switch (action.type) {
    case getType(IstioStatusActions.setinfo):
      return action.payload;
    default:
      return state;
  }
};
