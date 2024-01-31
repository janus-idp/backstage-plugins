export enum TextInputTypes {
  text = 'text',
  date = 'date',
  datetimeLocal = 'datetime-local',
  email = 'email',
  month = 'month',
  number = 'number',
  password = 'password',
  search = 'search',
  tel = 'tel',
  time = 'time',
  url = 'url',
}

// FilterValue maps a Patternfly property. Modify with care.
export interface FilterValue {
  id: string;
  title: string;
}

enum NonInputTypes {
  typeAhead = 'typeahead',
  select = 'select',
  label = 'label',
  nsLabel = 'nsLabel',
}

export const AllFilterTypes = {
  ...TextInputTypes,
  ...NonInputTypes,
};

// FilterType maps a Patternfly property. Modify with care.
export interface FilterType {
  category: string; // unique filter category name, should be suitable for display or URL query parameter
  placeholder: string;
  filterType: NonInputTypes | TextInputTypes;
  action: string;
  filterValues: FilterValue[];
  loader?: () => Promise<FilterValue[]>;
}

export interface RunnableFilter<T> extends FilterType {
  run: (item: T, filters: ActiveFiltersInfo) => boolean;
}

export const FILTER_ACTION_APPEND = 'append';
export const FILTER_ACTION_UPDATE = 'update';

export interface ActiveFilter {
  category: string;
  value: string;
}

export type LabelOperation = 'and' | 'or';
export const ID_LABEL_OPERATION = 'opLabel';
export const DEFAULT_LABEL_OPERATION: LabelOperation = 'or';

export interface ActiveFiltersInfo {
  filters: ActiveFilter[];
  op: LabelOperation;
}

export interface ToggleType {
  label: string;
  name: string;
  isChecked: boolean;
}

export type ActiveTogglesInfo = Map<string, boolean>;
