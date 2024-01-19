import { getType } from 'typesafe-actions';

import { HelpDropdownActions } from '../actions/HelpDropdownActions';
import { KialiAppAction } from '../actions/KialiAppAction';
import { StatusState } from '../types/StatusState';

export const INITIAL_STATUS_STATE: StatusState = {
  status: {},
  externalServices: [],
  warningMessages: [],
  istioEnvironment: {
    isMaistra: false,
    istioAPIEnabled: true,
  },
};

export const HelpDropdownStateReducer = (
  state: StatusState = INITIAL_STATUS_STATE,
  action: KialiAppAction,
): StatusState => {
  switch (action.type) {
    case getType(HelpDropdownActions.statusRefresh):
      return {
        ...INITIAL_STATUS_STATE,
        status: action.payload.status,
        externalServices: action.payload.externalServices,
        warningMessages: action.payload.warningMessages,
        istioEnvironment: action.payload.istioEnvironment,
      };
    default:
      return state;
  }
};
