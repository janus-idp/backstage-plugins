import * as React from 'react';

import { EmptyState } from '@backstage/core-components';

import {
  Card,
  CardContent,
  CardHeader,
  TableCellProps,
  Typography,
} from '@material-ui/core';

import { IstioConfigItem } from '../../types/IstioConfigList';
import { IstioObjectLink } from '../Link/IstioObjectLink';
import { PFBadge } from '../Pf/PfBadges';
import { SimpleTable, tRow } from '../SimpleTable';
import { ValidationObjectSummary } from '../Validations/ValidationObjectSummary';
import { IstioTypes } from '../VirtualList/Config';

type IstioConfigCardProps = {
  items: IstioConfigItem[];
  name: string;
};

export const IstioConfigCard: React.FC<IstioConfigCardProps> = (
  props: IstioConfigCardProps,
) => {
  const columns: TableCellProps[] = [
    { title: 'Name' },
    { title: 'Status', width: 10 },
  ];

  const noIstioConfig: React.ReactNode = (
    <EmptyState
      missing="content"
      title="No Istio Config"
      description={<div>No Istio Config found for {props.name}</div>}
    />
  );

  const overviewLink = (item: IstioConfigItem): React.ReactNode => {
    return (
      <IstioObjectLink
        name={item.name}
        namespace={item.namespace ?? ''}
        cluster={item.cluster}
        type={item.type}
      >
        {item.name}
      </IstioObjectLink>
    );
  };

  const rows: tRow = props.items
    .sort((a: IstioConfigItem, b: IstioConfigItem) => {
      if (a.type < b.type) {
        return -1;
      } else if (a.type > b.type) {
        return 1;
      }
      return a.name < b.name ? -1 : 1;
    })
    .map((item, itemIdx) => {
      return {
        cells: [
          <span>
            <PFBadge badge={IstioTypes[item.type].badge} position="top" />
            {overviewLink(item)}
          </span>,
          <ValidationObjectSummary
            id={`${itemIdx}-config-validation`}
            validations={item.validation ? [item.validation] : []}
          />,
        ],
      };
    });

  return (
    <Card id="IstioConfigCard">
      <CardHeader
        title={
          <Typography variant="h6" style={{ margin: '10px' }}>
            Istio Config
          </Typography>
        }
      />

      <CardContent>
        <SimpleTable
          label="Istio Config List"
          columns={columns}
          rows={rows}
          emptyState={noIstioConfig}
        />
      </CardContent>
    </Card>
  );
};
