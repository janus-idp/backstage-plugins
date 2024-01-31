import * as React from 'react';

import { history, HistoryManager } from '../../app/History';
import {
  ActiveFilter,
  ActiveFiltersInfo,
  ActiveTogglesInfo,
  FilterType,
  LabelOperation,
  ToggleType,
} from '../../types/Filters';
import * as FilterHelper from '../FilterList/FilterHelper';

export class FilterSelected {
  static selectedFilters: ActiveFilter[] | undefined = undefined;
  static opSelected: LabelOperation;

  static init = (filterTypes: FilterType[]) => {
    let active = FilterSelected.getSelected();
    if (!FilterSelected.isInitialized()) {
      active = FilterHelper.getFiltersFromURL(filterTypes);
      FilterSelected.setSelected(active);
    } else if (!FilterHelper.filtersMatchURL(filterTypes, active)) {
      active = FilterHelper.setFiltersToURL(filterTypes, active);
      FilterSelected.setSelected(active);
    }
    return active;
  };

  static resetFilters = () => {
    FilterSelected.selectedFilters = undefined;
  };

  static setSelected = (activeFilters: ActiveFiltersInfo) => {
    FilterSelected.selectedFilters = activeFilters.filters;
    FilterSelected.opSelected = activeFilters.op;
  };

  static getSelected = (): ActiveFiltersInfo => {
    return {
      filters: FilterSelected.selectedFilters || [],
      op: FilterSelected.opSelected || 'or',
    };
  };

  static isInitialized = () => {
    return FilterSelected.selectedFilters !== undefined;
  };
}

// Column toggles
export class Toggles {
  static checked: ActiveTogglesInfo = new Map<string, boolean>();
  static numChecked = 0;

  static init = (toggles: ToggleType[]): number => {
    Toggles.checked.clear();
    Toggles.numChecked = 0;

    // Prefer URL settings
    const urlParams = new URLSearchParams(history.location.search);
    toggles.forEach(t => {
      const urlIsChecked = HistoryManager.getBooleanParam(
        `${t.name}Toggle`,
        urlParams,
      );
      const isChecked = urlIsChecked === undefined ? t.isChecked : urlIsChecked;
      Toggles.checked.set(t.name, isChecked);
      if (isChecked) {
        Toggles.numChecked++;
      }
    });
    return Toggles.numChecked;
  };

  static setToggle = (name: string, value: boolean): number => {
    HistoryManager.setParam(`${name}Toggle`, `${value}`);
    Toggles.checked.set(name, value);
    Toggles.numChecked = value ? Toggles.numChecked++ : Toggles.numChecked--;
    return Toggles.numChecked;
  };

  static getToggles = (): ActiveTogglesInfo => {
    return new Map<string, boolean>(Toggles.checked);
  };
}

export interface StatefulFiltersProps {
  childrenFirst?: boolean;
  initialFilters: FilterType[];
  initialToggles?: ToggleType[];
  onFilterChange: (active: ActiveFiltersInfo) => void;
  onToggleChange?: (active: ActiveTogglesInfo) => void;
  ref?: React.RefObject<any>;
}

export interface StatefulFilters {
  filterAdded(labelFilt: FilterType, label: string): unknown;
  removeFilter(category: string, label: string): unknown;
}
