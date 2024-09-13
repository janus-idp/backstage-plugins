import React from 'react';

import { makeStyles } from '@material-ui/core';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Title,
} from '@patternfly/react-core';
import {
  ChatbotHeader,
  ChatbotHeaderActions,
  ChatbotHeaderTitle,
} from '@patternfly/virtual-assistant';

type LightspeedChatBoxHeaderProps = {
  selectedModel: string;
  handleSelectedModel: (item: string) => void;
  models: { label: string; value: string }[];
};

const useStyles = makeStyles(theme => ({
  headerTitle: {
    justifyContent: 'left !important',
  },
  header: {
    padding: `${theme.spacing(3)}px !important`,
  },
}));

export const LightspeedChatBoxHeader = ({
  selectedModel,
  handleSelectedModel,
  models,
}: LightspeedChatBoxHeaderProps) => {
  const classes = useStyles();
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = React.useState(false);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="secondary"
      aria-label="Chatbot selector"
      ref={toggleRef}
      isExpanded={isOptionsMenuOpen}
      onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
    >
      {selectedModel}
    </MenuToggle>
  );

  return (
    <ChatbotHeader className={classes.header}>
      <ChatbotHeaderTitle className={classes.headerTitle}>
        <Title headingLevel="h1" size="3xl">
          Developer Hub Lightspeed
        </Title>
      </ChatbotHeaderTitle>
      <ChatbotHeaderActions>
        <Dropdown
          isOpen={isOptionsMenuOpen}
          onSelect={(_e, value) => {
            handleSelectedModel(value as string);
            setIsOptionsMenuOpen(false);
          }}
          onOpenChange={isOpen => setIsOptionsMenuOpen(isOpen)}
          popperProps={{ position: 'right' }}
          shouldFocusToggleOnSelect
          shouldFocusFirstItemOnOpen={false}
          toggle={toggle}
        >
          <DropdownList>
            {models.map(m => (
              <DropdownItem value={m.value} key={m.value}>
                {m.label}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
      </ChatbotHeaderActions>
    </ChatbotHeader>
  );
};
