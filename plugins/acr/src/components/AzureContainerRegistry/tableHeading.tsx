import { TableColumn } from '@backstage/core-components';
import makeStyles from '@material-ui/core/styles/makeStyles';

export const columns: TableColumn[] = [
  {
    title: 'Version',
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Created',
    field: 'createdTime',
    type: 'date',
  },
  {
    title: 'Modified',
    field: 'lastModified',
    type: 'date',
  },
  {
    title: 'Manifest',
    field: 'manifest_digest',
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
