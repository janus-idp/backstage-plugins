import { TableColumn } from '@backstage/core-components';
import makeStyles from '@material-ui/core/styles/makeStyles';

export const columns: TableColumn[] = [
  {
    title: 'Tag',
    field: 'name',
  },
  {
    title: 'Last Modified',
    field: 'last_modified',
    type: 'date',
  },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
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
