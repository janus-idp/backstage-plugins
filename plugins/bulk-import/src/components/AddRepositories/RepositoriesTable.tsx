import * as React from 'react';

import { WarningPanel } from '@backstage/core-components';

import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { useFormikContext } from 'formik';

import { useRepositories } from '../../hooks';
import {
  AddedRepositories,
  AddRepositoriesFormValues,
  AddRepositoryData,
  Order,
  RepositorySelection,
  RepositoryStatus,
} from '../../types';
import {
  evaluateRowForOrg,
  evaluateRowForRepo,
  filterSelectedForActiveDrawer,
  getComparator,
  getNewOrgsData,
  updateWithNewSelectedRepositories,
} from '../../utils/repository-utils';
import { AddRepositoriesDrawer } from './AddRepositoriesDrawer';
import { RepositoriesHeader } from './RepositoriesHeader';
import { RepositoriesTableBody } from './RepositoriesTableBody';

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
  drawerOrganization?: string;
  updateSelectedReposInDrawer?: (repos: AddedRepositories) => void;
}) => {
  const { setFieldValue, values } =
    useFormikContext<AddRepositoriesFormValues>();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>(
    showOrganizations ? 'repoName' : 'orgName',
  );
  const [selected, setSelected] = React.useState<AddedRepositories>({});
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [tableData, setTableData] = React.useState<AddRepositoryData[]>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [activeOrganization, setActiveOrganization] =
    React.useState<AddRepositoryData | null>();
  const [localPage, setLocalPage] = React.useState(page || 0);
  const [drawerPage, setDrawerPage] = React.useState(0);

  const { loading, data, error } = useRepositories({
    showOrganizations,
    orgName: drawerOrganization,
    page: (drawerOrganization ? drawerPage : localPage) + 1,
    querySize: rowsPerPage,
  });

  const [orgsData, setOrgsData] = React.useState<{
    [name: string]: AddRepositoryData;
  }>({});
  const [, setReposData] = React.useState<{
    [name: string]: AddRepositoryData;
  }>({});

  React.useEffect(() => {
    if (drawerOrganization) {
      setDrawerPage(0);
    } else if (setPage) {
      setPage(localPage);
    }
  }, [drawerOrganization, localPage, setPage]);

  React.useEffect(() => {
    if (drawerOrganization) {
      setSelected(values.repositories);
    }
  }, [drawerOrganization, values?.repositories]);

  React.useEffect(() => {
    if (showOrganizations) {
      setOrgsData(prev => {
        const orgs = data?.organizations?.reduce(
          (acc, o) => ({ ...acc, [o.orgName || '']: o }),
          prev,
        );

        setTableData(Object.values({ ...orgs }));
        return { ...orgs };
      });
    } else {
      setReposData(prev => {
        const repos = data?.repositories?.reduce(
          (acc, r) => ({ ...acc, [r.id]: r }),
          prev,
        );
        setTableData(Object.values({ ...repos }));
        return { ...repos };
      });
    }
  }, [data?.repositories, data?.organizations, showOrganizations, page]);

  const filteredData = React.useMemo(() => {
    let filteredRows = !showOrganizations
      ? evaluateRowForRepo(tableData, values.repositories)
      : evaluateRowForOrg(tableData, values.repositories);

    if (searchString) {
      const f = searchString.toUpperCase();
      filteredRows = filteredRows?.filter((addRepoData: AddRepositoryData) => {
        const n = (
          values.repositoryType === RepositorySelection.Repository ||
          drawerOrganization
            ? addRepoData.repoName
            : addRepoData.orgName
        )?.toUpperCase();
        return n?.includes(f);
      });
    }
    filteredRows = [...(filteredRows || [])]?.sort(
      getComparator(order, orderBy),
    );

    return filteredRows;
  }, [
    tableData,
    searchString,
    order,
    orderBy,
    drawerOrganization,
    values.repositoryType,
    values?.repositories,
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
    (newSelected: AddedRepositories) => {
      setFieldValue(
        'repositories',
        updateWithNewSelectedRepositories(values.repositories, newSelected),
      );
    },
    [setFieldValue, values],
  );

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

  const handleClickAllForRepositoriesTable = (drawer?: boolean) => {
    let newSelectedRows: AddedRepositories = { ...selected };

    const rowsEligibleForSelection = visibleRows.filter(
      r => !values.excludedRepositories[r.id],
    );
    const isAllSelected = rowsEligibleForSelection.every(
      row => selected[row.id],
    );

    rowsEligibleForSelection.forEach(row => {
      if (isAllSelected) {
        delete newSelectedRows[row.id];
      } else {
        if (!drawer) {
          setFieldValue(
            `repositories.${row.repoName}.catalogInfoYaml.status`,
            RepositoryStatus.Ready,
          );
        }
        newSelectedRows = { ...newSelectedRows, [row.id]: row };
      }
    });

    setSelected(newSelectedRows);
    if (drawer) {
      updateSelectedReposInDrawer?.(newSelectedRows);
    } else {
      updateSelectedRepositories(newSelectedRows);
    }

    const newOrgsData = Object.values(orgsData)?.reduce((orgAcc, org) => {
      return {
        ...orgAcc,
        [org.orgName as string]: {
          ...org,
          selectedRepositories: Object.values(newSelectedRows)?.reduce(
            (acc, row) => {
              if (row.orgName === org.orgName) {
                return {
                  ...acc,
                  [row.id]: {
                    ...row,
                    catalogInfoYaml: {
                      ...row.catalogInfoYaml,
                      status: RepositoryStatus.Ready,
                    },
                  },
                };
              }
              return acc;
            },
            {},
          ),
        },
      };
    }, {});
    setOrgsData(newOrgsData);
  };
  const handleSelectAllClick = (
    _event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (drawerOrganization) {
      handleClickAllForRepositoriesTable(true);
    } else {
      handleClickAllForRepositoriesTable();
    }
  };

  const updateSelection = (newSelected: AddedRepositories) => {
    setSelected(newSelected);

    if (drawerOrganization && updateSelectedReposInDrawer) {
      // Update in the context of the drawer
      updateSelectedReposInDrawer(newSelected);
    } else {
      // Update outside the drawer, in main context
      updateSelectedRepositories(newSelected);
    }
  };

  const handleClick = (_event: React.MouseEvent, repo: AddRepositoryData) => {
    let newSelected;
    if (selected[repo.id]) {
      newSelected = { ...selected };
      delete newSelected[repo.id];
    } else {
      newSelected = { ...selected, [repo.id]: repo };
    }
    updateSelection(newSelected);
    // handle non drawer selection click
    if (!drawerOrganization) {
      const newOrgsData = getNewOrgsData(orgsData, repo);
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

  const handleOrgRowSelected = React.useCallback((org: AddRepositoryData) => {
    setActiveOrganization(org);
    setIsOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setActiveOrganization(null);
  }, [setIsOpen]);

  const handleUpdatesFromDrawer = React.useCallback(
    (drawerSelected: AddedRepositories, drawerOrgId: string) => {
      if (drawerSelected) {
        setSelected(drawerSelected);
        updateSelectedRepositories(drawerSelected);

        const newOrgsData = Object.values(orgsData).reduce((acc, org) => {
          if (org.id === drawerOrgId) {
            return {
              ...acc,
              [org.orgName as string]: {
                ...org,
                selectedRepositories: drawerSelected,
              },
            };
          }
          return acc;
        }, {});
        setOrgsData(newOrgsData);
      }
    },
    [updateSelectedRepositories, orgsData, setOrgsData, setSelected],
  );

  const selectedForActiveDrawer = React.useMemo(
    () => filterSelectedForActiveDrawer(tableData || [], selected),
    [tableData, selected],
  );

  const getRowCount = () => {
    if (drawerOrganization) {
      return tableData?.filter(
        r =>
          !Object.keys(values.excludedRepositories).find(
            ex => ex === r.repoName,
          ),
      )?.length;
    }
    return tableData?.length;
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
        {error && Object.keys(error).length > 0 ? (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={
                error?.message ||
                (Array.isArray(error?.errors) && error.errors.length > 1
                  ? error?.errors?.join('\n')
                  : error.errors)
              }
              title={error?.name}
              severity="error"
            />
          </div>
        ) : (
          <Table sx={{ minWidth: 750 }} size="small" data-testid={ariaLabel()}>
            <RepositoriesHeader
              numSelected={
                drawerOrganization
                  ? Object.keys(selectedForActiveDrawer).length
                  : Object.keys(selected).length
              }
              isDataLoading={loading}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={getRowCount() || 0}
              showOrganizations={drawerOrganization ? false : showOrganizations}
              isRepoSelectDrawer={!!drawerOrganization}
            />
            <RepositoriesTableBody
              loading={loading}
              ariaLabel={ariaLabel()}
              rows={visibleRows}
              emptyRows={emptyRows}
              onOrgRowSelected={handleOrgRowSelected}
              onClick={handleClick}
              selectedRepos={selected}
              isDrawer={!!drawerOrganization}
              showOrganizations={showOrganizations}
            />
          </Table>
        )}
      </TableContainer>
      {!isOpen && tableData?.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[
            { value: 5, label: '5 rows' },
            { value: 10, label: '10 rows' },
            { value: 20, label: '20 rows' },
            { value: 50, label: '50 rows' },
            { value: 100, label: '100 rows' },
          ]}
          component="div"
          count={
            (showOrganizations
              ? data?.totalOrganizations
              : data?.totalRepositories) || 0
          }
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
          orgData={activeOrganization}
          onSelect={handleUpdatesFromDrawer}
          open={isOpen}
          onClose={handleClose}
        />
      )}
    </>
  );
};
