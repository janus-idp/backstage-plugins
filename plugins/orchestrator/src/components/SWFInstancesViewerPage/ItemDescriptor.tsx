import React from 'react';

import { Badge, Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

export interface ItemDescription {
  id: string;
  name: string;
  description?: string;
}

interface IOwnProps {
  itemDescription: ItemDescription;
}

const ItemDescriptor = (props: IOwnProps) => {
  const { itemDescription } = props;

  const idStringModifier = (strId: string) => {
    return <Typography>{strId.substring(0, 5)}</Typography>;
  };
  return (
    <Tooltip title={itemDescription.id}>
      <Typography variant="body2" component="span">
        {itemDescription.name}{' '}
        {itemDescription.description ? (
          <Badge>{itemDescription.description}</Badge>
        ) : (
          idStringModifier(itemDescription.id)
        )}
      </Typography>
    </Tooltip>
  );
};

export default ItemDescriptor;
