import React from 'react';

import { SidebarItem } from '@backstage/core-components';

import { getImageForIconClass } from '../utils/icons';

export const icon = () => {
  return (
    <img
      src={getImageForIconClass('icon-bulk-import-white')}
      alt="bulk import icon"
      style={{ height: '25px' }}
    />
  );
};

export const BulkImportIcon = () => {
  // permission logic

  return (
    <SidebarItem text="Bulk import" to="bulk-import/repositories" icon={icon} />
  );
};
