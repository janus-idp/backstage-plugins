import { TableColumn } from '@backstage/core-components';
import makeStyles from '@material-ui/core/styles/makeStyles';

export const columns: TableColumn[] = [
  {
    title: 'Repos',
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
    title: 'Vulnerabilities (Critical)',
    field: 'vulnerabilities_critical',
    type: 'numeric',
  },
  {
    title: 'Vulnerabilities (High)',
    field: 'vulnerabilities_high',
    type: 'numeric',
  },
  {
    title: 'Vulnerabilities (Medium)',
    field: 'vulnerabilities_medium',
    type: 'numeric',
  },
  {
    title: 'Vulnerabilities (Low)',
    field: 'vulnerabilities_low',
    type: 'numeric',
  },
  {
    title: 'Vulnerabilities (Info)',
    field: 'vulnerabilities_info',
    type: 'numeric',
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
