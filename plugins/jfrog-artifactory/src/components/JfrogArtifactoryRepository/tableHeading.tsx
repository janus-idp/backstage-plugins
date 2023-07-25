import { TableColumn } from '@backstage/core-components';
import makeStyles from '@material-ui/core/styles/makeStyles';

const vulnerabilityTotal = (rowData: any): number => {
  const fields = [
    'vulnerabilities_critical',
    'vulnerabilities_high',
    'vulnerabilities_medium',
    'vulnerabilities_low',
    'vulnerabilities_info',
  ];
  return fields.reduce((total, field) => total + (rowData[field] || 0), 0);
};

export const columns: TableColumn[] = [
  {
    title: 'Repository',
    field: 'repos',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Version Repository',
    field: 'repository',
    type: 'string',
  },
  {
    title: 'Version',
    field: 'name',
    type: 'string',
  },
  {
    title: 'Downloads',
    field: 'downloads',
    type: 'string',
  },
  {
    title: 'Modified',
    field: 'last_modified',
    type: 'date',
  },
  {
    title: 'Size',
    field: 'size',
    type: 'string',
  },
  {
    title: 'Vulnerabilities',
    field: 'vulnerabilities',
    render: (rowData: any) => vulnerabilityTotal(rowData).toString(),
    type: 'numeric',
    id: 'vulnerabilities',
  },
  {
    title: 'Package Type',
    field: 'package_type',
    type: 'string',
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));
