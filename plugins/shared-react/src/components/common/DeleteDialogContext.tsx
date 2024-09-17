import React, { createContext, useContext } from 'react';

type DeleteDialogContextType = {
  deleteComponent: { [key: string]: any };
  setDeleteComponent: (component: { [key: string]: any }) => void;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
};

export const DeleteDialogContext = createContext<DeleteDialogContextType>({
  deleteComponent: {},
  setDeleteComponent: () => {},
  openDialog: false,
  setOpenDialog: () => {},
});

export const DeleteDialogContextProvider = (props: any) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [deleteComponent, setDeleteComponent] = React.useState({});

  const deleteDialogContextProviderValue = React.useMemo(
    () => ({
      openDialog,
      setOpenDialog,
      deleteComponent,
      setDeleteComponent,
    }),
    [openDialog, setOpenDialog, deleteComponent, setDeleteComponent],
  );
  return (
    <DeleteDialogContext.Provider value={deleteDialogContextProviderValue}>
      {props.children}
    </DeleteDialogContext.Provider>
  );
};
export const useDeleteDialog = () => useContext(DeleteDialogContext);
