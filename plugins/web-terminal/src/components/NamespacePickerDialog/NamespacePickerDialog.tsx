import { Progress } from '@backstage/core-components';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  Select,
  MenuItem,
  makeStyles,
  Button,
} from '@material-ui/core';
import React, { useEffect } from 'react';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  buttonmargin: {
    marginTop: '10px',
    marginBottom: '10px',
  },
});

type props = {
  onInit: () => Promise<any>;
  open: boolean;
  previousNamespace: string;
  handleClose: () => void;
  onSubmit: (selectedNamesapce: string) => void;
};

export const NamespacePickerDialog = ({
  onInit,
  open,
  previousNamespace,
  handleClose,
  onSubmit,
}: props) => {
  const classes = useStyles();
  const namespaceRef = React.useRef<HTMLInputElement>(null);
  const [selectedNamespace, setSelectedNamespace] = React.useState('');
  const [namespaces, setNamespaces] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedNamespace(event.target.value as string);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(selectedNamespace);
  };

  useEffect(() => {
    setLoading(true);
    onInit()
      .then(setNamespaces)
      .then(() => setLoading(false));
  }, [onInit]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Choose a namespace</DialogTitle>

      {loading && (
        <DialogContent>
          <DialogContentText>
            Please wait while we fetch the list of namespaces
          </DialogContentText>
          <Progress />
        </DialogContent>
      )}

      {!loading && (
        <DialogContent>
          <DialogContentText>
            Unable to create devworkspace resource in {previousNamespace}{' '}
            namespace, please choose a different one
          </DialogContentText>
          <form onSubmit={handleSubmit} className={classes.container}>
            <FormControl>
              <Select
                name="namespace"
                inputRef={namespaceRef}
                onChange={handleChange}
                value={selectedNamespace}
                displayEmpty
                required
              >
                <MenuItem value="" disabled>
                  Select a namespace
                </MenuItem>
                {namespaces.map(namespace => {
                  return (
                    <MenuItem key={namespace} value={namespace}>
                      {namespace}
                    </MenuItem>
                  );
                })}
              </Select>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.buttonmargin}
              >
                Submit
              </Button>
            </FormControl>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
};
