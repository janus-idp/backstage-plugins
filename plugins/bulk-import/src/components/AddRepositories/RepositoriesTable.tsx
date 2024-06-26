import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useAsync } from 'react-use';

import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { makeStyles } from '@material-ui/core';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useFormikContext } from 'formik';

import { getDataForRepositories, mockData } from '../../mocks/mockData';
import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  Order,
  RepositorySelection,
  RepositoryStatus,
} from '../../types';
import {
  createOrganizationData,
  filterSelectedForActiveDrawer,
  getComparator,
  getNewOrgsData,
  getSelectedRepositories,
  updateWithNewSelectedRepositories,
} from '../../utils/repository-utils';
import { AddRepositoriesDrawer } from './AddRepositoriesDrawer';
import { OrganizationTableRow } from './OrganizationTableRow';
import { RepositoriesColumnHeader } from './RepositoriesColumnHeader';
import { RepositoriesHeader } from './RepositoriesHeader';
import { RepositoryTableRow } from './RepositoryTableRow';

const useStyles = makeStyles(theme => ({
  root: {
    alignItems: 'start',
    padding: theme.spacing(3, 0, 2.5, 2.5),
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  footer: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}`,
    },
  },
}));

export const RepositoriesTable = ({
  searchString,
  page,
  setPage,
  showOrganizations = false,
  drawerOrganization,
  updateSelectedReposInDrawer,
}: {
  searchString: string;
  page?: number;
  setPage?: (page: number) => void;
  showOrganizations?: boolean;
  drawerOrganization?: AddRepositoriesData;
  updateSelectedReposInDrawer?: (ids: number[]) => void;
}) => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });
  const { setFieldValue, values } =
    useFormikContext<AddRepositoriesFormValues>();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>(
    showOrganizations ? 'repoName' : 'orgName',
  );
  const [selected, setSelected] = React.useState<number[]>([]);

  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [tableData, setTableData] = React.useState<AddRepositoriesData[]>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [activeOrganization, setActiveOrganization] =
    React.useState<AddRepositoriesData | null>();
  const [localPage, setLocalPage] = React.useState(page || 0);
  const [drawerPage, setDrawerPage] = React.useState(0);

  const reposData = useMemo(() => {
    return getDataForRepositories(user || '');
  }, [user]);
  const [orgsData, setOrgsData] = React.useState<AddRepositoriesData[]>([]);

  const orgReposData = drawerOrganization?.repositories;

  useEffect(() => {
    setOrgsData(createOrganizationData(mockData(user || '')));
  }, [user]);

  useEffect(() => {
    setLocalPage(page || 0);
  }, [page]);

  useEffect(() => {
    if (drawerOrganization) {
      setDrawerPage(0);
    } else if (setPage) {
      setPage(localPage);
    }
  }, [drawerOrganization, localPage, setPage]);

  useEffect(() => {
    if (drawerOrganization) {
      const selectedOrgRepoIds = Object.values(values.repositories).map(
        r => r.id,
      );
      setSelected(selectedOrgRepoIds);
    }
  }, [drawerOrganization, values?.repositories]);

  useEffect(() => {
    if (drawerOrganization) {
      setTableData(orgReposData || []);
    } else {
      setTableData(showOrganizations ? orgsData : reposData);
    }
  }, [
    drawerOrganization,
    orgReposData,
    reposData,
    orgsData,
    showOrganizations,
  ]);

  const filteredData = React.useMemo(() => {
    let filteredRows = tableData;

    if (searchString) {
      const f = searchString.toUpperCase();
      filteredRows = filteredRows.filter((addRepoData: AddRepositoriesData) => {
        const n = (
          values.repositoryType === RepositorySelection.Repository ||
          drawerOrganization
            ? addRepoData.repoName
            : addRepoData.orgName
        )?.toUpperCase();
        return n?.includes(f);
      });
    }
    filteredRows = [...filteredRows].sort(
      getComparator(order, orderBy, showOrganizations),
    );

    return filteredRows;
  }, [
    tableData,
    searchString,
    order,
    orderBy,
    drawerOrganization,
    values.repositoryType,
    showOrganizations,
  ]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const updateSelectedRepositories = React.useCallback(
    (data: AddRepositoriesData[], newSelected: number[]) => {
      setFieldValue(
        'repositories',
        updateWithNewSelectedRepositories(
          data,
          values.repositories,
          newSelected,
        ),
      );
    },
    [setFieldValue, values],
  );
  const handleClickAllForDrawerSelection = (checked: boolean) => {
    if (updateSelectedReposInDrawer) {
      if (checked) {
        // Select all repos that don't have the status 'Exists', set added repos id to -1
        const newSelected = filteredData.reduce(
          (acc, repo) => {
            if (repo.catalogInfoYaml?.status !== RepositoryStatus.Exists) {
              acc.push(repo.id);
            }
            return acc;
          },
          [...selected],
        );
        const uniqueSelected = Array.from(new Set(newSelected));
        setSelected(uniqueSelected);
        updateSelectedReposInDrawer(uniqueSelected);
      } else {
        // Deselect all
        const deselectedIds = new Set(filteredData.map(repo => repo.id));
        const newSelected = selected.filter(id => !deselectedIds.has(id));

        setSelected(newSelected);
        updateSelectedReposInDrawer(newSelected);
      }
    }
  };
  const handleClickAllForRepositoriesTable = (checked: boolean) => {
    if (checked) {
      // Select all valid repos
      const newSelected = filteredData
        .map(n => {
          if (n.catalogInfoYaml?.status !== RepositoryStatus.Exists) {
            setFieldValue(
              `repositories.${n.repoName}.catalogInfoYaml.status`,
              RepositoryStatus.Ready,
            );
            return n.id;
          }
          return -1;
        })
        .filter(d => d);
      setSelected(newSelected);
      updateSelectedRepositories(filteredData, newSelected);
      const newOrgsData = orgsData.map(org => {
        return {
          ...org,
          selectedRepositories:
            (org.repositories
              ?.map(repo => {
                if (repo.catalogInfoYaml?.status !== RepositoryStatus.Exists) {
                  return {
                    ...repo,
                    catalogInfoYaml: {
                      ...repo.catalogInfoYaml,
                      status: RepositoryStatus.Ready,
                    },
                  };
                }
                return null;
              })
              .filter(v => v) as AddRepositoriesData[]) || [],
        };
      });
      setOrgsData(newOrgsData);
    } else {
      // Deselect all
      updateSelectedRepositories([], []);
      setSelected([]);
      const newOrgsData = orgsData.map(org => {
        return { ...org, selectedRepositories: [] };
      });
      setOrgsData(newOrgsData);
    }
  };
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    if (drawerOrganization) {
      handleClickAllForDrawerSelection(checked);
    } else {
      handleClickAllForRepositoriesTable(checked);
    }
  };

  const updateSelection = (newSelected: number[]) => {
    setSelected(newSelected);

    if (drawerOrganization && updateSelectedReposInDrawer) {
      // Update in the context of the drawer
      updateSelectedReposInDrawer(newSelected);
    } else {
      // Update outside the drawer, in main context
      updateSelectedRepositories(reposData, newSelected);
    }
  };

  const handleClick = (_event: React.MouseEvent, id: number) => {
    const newSelected = selected.includes(id)
      ? selected.filter(selId => selId !== id)
      : [...selected, id];
    updateSelection(newSelected);
    // handle non drawer selection click
    if (!drawerOrganization) {
      const newOrgsData = getNewOrgsData(orgsData, reposData, newSelected, id);
      setOrgsData(newOrgsData);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (drawerOrganization) {
      setDrawerPage(newPage);
    } else {
      setLocalPage(newPage);
      if (setPage) {
        setPage(newPage);
      }
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    if (drawerOrganization) {
      setDrawerPage(0);
    } else {
      setLocalPage(0);
      if (setPage) {
        setPage(0);
      }
    }
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;
  const effectivePage = drawerOrganization ? drawerPage : page || 0;
  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    effectivePage > 0
      ? Math.max(0, (1 + effectivePage) * rowsPerPage - tableData.length)
      : 0;

  const visibleRows = React.useMemo(() => {
    return filteredData.slice(
      effectivePage * rowsPerPage,
      effectivePage * rowsPerPage + rowsPerPage,
    );
  }, [filteredData, rowsPerPage, effectivePage]);

  const handleOrgRowSelected = React.useCallback((org: AddRepositoriesData) => {
    setActiveOrganization(org);
    setIsOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setActiveOrganization(null);
  }, [setIsOpen]);

  const handleUpdatesFromDrawer = React.useCallback(
    (drawerSelected: number[], drawerOrgId: number) => {
      if (drawerSelected) {
        setSelected(drawerSelected);
        updateSelectedRepositories(reposData, drawerSelected);

        const newOrgsData = orgsData.map(org => {
          if (org.id === drawerOrgId) {
            const selectedRepositories = getSelectedRepositories(
              org,
              drawerSelected,
            );
            return { ...org, selectedRepositories };
          }
          return org;
        });
        setOrgsData(newOrgsData);
      }
    },
    [reposData, updateSelectedRepositories, orgsData, setOrgsData, setSelected],
  );

  const selectedForActiveDrawer = React.useMemo(
    () =>
      filterSelectedForActiveDrawer(
        drawerOrganization?.repositories || [],
        selected,
      ),
    [drawerOrganization?.repositories, selected],
  );

  const getRowCount = () => {
    if (drawerOrganization) {
      return orgReposData?.filter(
        r => r.catalogInfoYaml?.status !== RepositoryStatus.Exists,
      ).length;
    }
    return tableData.length;
  };

  const ariaLabel = () => {
    if (drawerOrganization) {
      return 'drawer-repositories-table';
    }
    if (showOrganizations) {
      return 'organizations-table';
    }
    return 'repositories-table';
  };

  return (
    <>
      <TableContainer sx={{ padding: '0 24px' }}>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby={ariaLabel()}
          size="small"
          data-testid={ariaLabel()}
        >
          <RepositoriesHeader
            numSelected={
              drawerOrganization
                ? selectedForActiveDrawer.length
                : selected.length
            }
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={getRowCount() || 0}
            showOrganizations={drawerOrganization ? false : showOrganizations}
            isRepoSelectDrawer={!!drawerOrganization}
          />
          {visibleRows?.length > 0 ? (
            <TableBody>
              {visibleRows.map(row => {
                const isItemSelected = isSelected(row.id);

                const selectedReposFromOrg =
                  row.repositories?.filter(repo =>
                    selected.includes(repo.id),
                  ) || [];
                const alreadyAddedCount =
                  row.repositories?.reduce(
                    (count, repo) =>
                      count +
                      (repo.catalogInfoYaml?.status === RepositoryStatus.Exists
                        ? 1
                        : 0),
                    0,
                  ) || 0;
                const orgData = {
                  ...row,
                  selectedRepositories: selectedReposFromOrg,
                };
                return showOrganizations ? (
                  <OrganizationTableRow
                    key={row.id}
                    onOrgRowSelected={handleOrgRowSelected}
                    data={orgData}
                    alreadyAdded={alreadyAddedCount}
                  />
                ) : (
                  <RepositoryTableRow
                    key={row.id}
                    handleClick={handleClick}
                    isItemSelected={isItemSelected}
                    data={row}
                    selectedRepositoryStatus={row.catalogInfoYaml?.status || ''}
                    isDrawer={!!drawerOrganization}
                  />
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 55 * emptyRows,
                  }}
                >
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={RepositoriesColumnHeader.length}>
                  <div
                    data-testid="no-repositories-found"
                    className={classes.empty}
                  >
                    No records found
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </TableContainer>
      {!isOpen && (
        <TablePagination
          rowsPerPageOptions={[
            { value: 5, label: '5 rows' },
            { value: 10, label: '10 rows' },
            { value: 15, label: '15 rows' },
          ]}
          component="div"
          count={tableData.length}
          rowsPerPage={rowsPerPage}
          page={effectivePage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={null}
        />
      )}
      {showOrganizations && activeOrganization && (
        <AddRepositoriesDrawer
          title="Selected repositories"
          data={activeOrganization}
          onSelect={handleUpdatesFromDrawer}
          open={isOpen}
          onClose={handleClose}
          checkedRepos={selected}
        />
      )}
    </>
  );
};
