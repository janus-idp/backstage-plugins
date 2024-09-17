import React, { createContext, useContext } from 'react';

type DrawerContextType = {
  drawerData: any;
  setDrawerData: (data: any) => void;
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
};

export const DrawerContext = createContext<DrawerContextType>({
  drawerData: {},
  setDrawerData: () => {},
  openDrawer: false,
  setOpenDrawer: () => {},
});

export const DrawerContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [drawerData, setDrawerData] = React.useState({});

  const drawerContextProviderValue = React.useMemo(
    () => ({
      openDrawer,
      setOpenDrawer,
      drawerData,
      setDrawerData,
    }),
    [openDrawer, setOpenDrawer, drawerData, setDrawerData],
  );
  return (
    <DrawerContext.Provider value={drawerContextProviderValue}>
      {children}
    </DrawerContext.Provider>
  );
};
export const useDrawer = () => useContext(DrawerContext);
