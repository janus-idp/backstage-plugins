import React, { useState } from 'react';
// eslint-disable-next-line  no-restricted-imports
import { Box, SwipeableDrawer, Typography } from '@material-ui/core';

function NewlineText(props: { text: string }): JSX.Element {
  const text = props.text;
  const newText = text.split('\n').map(str => <p>{str}</p>);

  return <Box>{newText}</Box>;
}

export function StepLog(props: { opened: boolean; log: string }) {
  const { opened, log } = props;
  const [open, setOpen] = useState<boolean>(opened);
  return (
    <div>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => {}}
      >
        <Typography
          style={{ wordWrap: 'break-word', width: 'auto', margin: 10 }}
        >
          <NewlineText text={log} />
        </Typography>
      </SwipeableDrawer>
    </div>
  );
}
