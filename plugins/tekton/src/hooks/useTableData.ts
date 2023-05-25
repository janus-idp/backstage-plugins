import React from 'react';
import { get } from 'lodash';
import { SortByDirection } from '@patternfly/react-table';

type UseTableDataProps<D = any> = {
  propData: D[];
  sortField?: string;
  sortOrder?: SortByDirection;
};

export const useTableData = ({
  propData,
  sortField = 'metadata.name',
  sortOrder = SortByDirection.asc,
}: UseTableDataProps) => {
  return React.useMemo(() => {
    const getSortValue = (resource: any) => {
      const val = get(resource, sortField);
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
        return sortOrder === SortByDirection.asc ? result : result * -1;
      }
      return 0;
    });
    return { data: propData, sortField, sortOrder };
  }, [propData, sortField, sortOrder]);
};
