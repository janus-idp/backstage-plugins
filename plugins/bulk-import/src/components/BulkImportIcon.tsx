import React from 'react';

import { SidebarItem } from '@backstage/core-components';
import { IconComponent } from '@backstage/core-plugin-api';

import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined';

export const BulkImportIcon = () => {
  // permission logic

  return (
    <SidebarItem
      text="Bulk import"
      to="bulk-import/repositories"
      icon={LibraryAddOutlinedIcon as IconComponent}
    />
  );
};
