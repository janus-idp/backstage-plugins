import React from 'react';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns } from './tableHeading';
import { useImageStreamFromCluster } from '../../hooks';
import { useParams } from 'react-router';
import { rootRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import { TableContainer, TableHead, makeStyles } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { Wrapper } from '../Wrapper';


const useStyles = makeStyles(theme => ({
  link: {
    display: 'flex',
    alignItems: 'center',
  },
  linkText: {
    marginLeft: '0.5rem',
    fontSize: '1.1rem',
  },
  tableHead: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const OcrImageContent = () => {
  const rootLink = useRouteRef(rootRouteRef);
  const { cluster, image } = useParams();
  const classes = useStyles();
  const { loading, data } = useImageStreamFromCluster(cluster, image);

  if (loading) {
    return <Progress />;
  }


  return (
      <div style={{ border: '1px solid #ddd' }}>
        <TableContainer>
          <TableHead className={classes.tableHead}>
            <Link to={rootLink()} className={classes.link}>
              <KeyboardBackspaceIcon />
              <span className={classes.linkText}>Back to images</span>
            </Link>
          </TableHead>
          <Table
            title={image}
            options={{ paging: true, padding: 'dense' }}
            data={data}
            columns={columns}
            emptyContent={
              <div className={classes.empty}>
                No data was added yet,&nbsp;
                <Link to="https://backstage.io/">learn how to add data</Link>.
              </div>
            }
          />
        </TableContainer>
      </div>
  );
}

export const OcrImage = () => (
  <Wrapper>
    <OcrImageContent />
  </Wrapper>
);
