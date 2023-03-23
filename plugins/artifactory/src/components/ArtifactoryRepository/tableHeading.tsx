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
    title: 'Repositories',
    field: 'repositories',
    type: 'string',
  },
  {
    title: 'Manifest',
    field: 'manifest_digest',
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
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));
