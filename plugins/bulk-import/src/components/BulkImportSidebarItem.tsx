import React from 'react';

import { SidebarItem } from '@backstage/core-components';

import { getImageForIconClass } from '../utils/icons';

export const BulkImportIcon = () => {
  return (
    <img
      src={getImageForIconClass('icon-bulk-import-white')}
      alt="bulk import icon"
      style={{ height: '25px' }}
    />
  );
};

export const BulkImportSidebarItem = () => {
  return (
    <SidebarItem
      text="Bulk import"
      to="bulk-import/repositories"
      icon={BulkImportIcon}
    />
  );
};
