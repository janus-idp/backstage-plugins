import React, { createContext, useContext } from 'react';

type DeleteDialogContextType = {
  deleteRoleName: string;
  setDeleteRoleName: (name: string) => void;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
};

export const DeleteDialogContext = createContext<DeleteDialogContextType>({
  deleteRoleName: '',
  setDeleteRoleName: () => {},
  openDialog: false,
  setOpenDialog: () => {},
});

export const DeleteDialogContextProvider = (props: any) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [deleteRoleName, setDeleteRoleName] = React.useState('');

  const deleteDialogContextProviderValue = React.useMemo(
    () => ({ openDialog, setOpenDialog, deleteRoleName, setDeleteRoleName }),
    [openDialog, setOpenDialog, deleteRoleName, setDeleteRoleName],
  );
  return (
    <DeleteDialogContext.Provider value={deleteDialogContextProviderValue}>
      {props.children}
    </DeleteDialogContext.Provider>
  );
};
export const useDeleteDialog = () => useContext(DeleteDialogContext);
