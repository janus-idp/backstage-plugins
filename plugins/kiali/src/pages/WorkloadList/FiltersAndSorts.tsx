import { presenceValues } from '../../components/Filters/CommonFilters';
import {
  ActiveFiltersInfo,
  AllFilterTypes,
  FILTER_ACTION_APPEND,
  FILTER_ACTION_UPDATE,
  FilterType,
  RunnableFilter,
} from '../../types/Filters';
import { NamespaceInfo } from '../../types/NamespaceInfo';

export const appLabelFilter: FilterType = {
  category: 'App Label',
  placeholder: 'Filter by App Label Validation',
  filterType: AllFilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: presenceValues,
};

export const labelFilter: RunnableFilter<NamespaceInfo> = {
  category: 'Namespace Label',
  placeholder: 'Filter by Namespace Label',
  filterType: AllFilterTypes.nsLabel,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
  run: (ns: NamespaceInfo, filters: ActiveFiltersInfo) => {
    return filters.filters.some(f => {
      if (f.value.includes('=')) {
        const [k, v] = f.value.split('=');
        return v
          .split(',')
          .some(
            val =>
              !!ns.labels && k in ns.labels && ns.labels[k].startsWith(val),
          );
      }
      return (
        !!ns.labels &&
        Object.keys(ns.labels).some(label => label.startsWith(f.value))
      );
    });
  },
};

export const versionLabelFilter: FilterType = {
  category: 'Version Label',
  placeholder: 'Filter by Version Label Validation',
  filterType: AllFilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: presenceValues,
};
