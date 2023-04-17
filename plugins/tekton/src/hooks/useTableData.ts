import React from 'react';
import { get } from 'lodash';
import { SortByDirection } from '@patternfly/react-table';

type UseTableDataProps<D = any> = {
  propData: D[];
  defaultSortField?: string;
  defaultSortOrder?: SortByDirection;
};

export const useTableData = ({
  propData,
  defaultSortField = 'metadata.name',
  defaultSortOrder = SortByDirection.asc,
}: UseTableDataProps) => {
  return React.useMemo(() => {
    const getSortValue = (resource: any) => {
      const val = get(resource, defaultSortField);
      return val ?? '';
    };

    propData?.sort((a: any, b: any) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      const result: number =
        Number.isFinite(aValue) && Number.isFinite(bValue)
          ? aValue - bValue
          : `${aValue}`.localeCompare(`${bValue}`);
      if (result !== 0) {
        return defaultSortOrder === SortByDirection.asc ? result : result * -1;
      }
      return 0;
    });
    return { data: propData };
  }, [propData, defaultSortField, defaultSortOrder]);
};
