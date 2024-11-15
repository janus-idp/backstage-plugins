import React from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { ChatbotHeaderActions } from '@patternfly/virtual-assistant';

type LightspeedChatBoxHeaderProps = {
  selectedModel: string;
  handleSelectedModel: (item: string) => void;
  models: { label: string; value: string }[];
};

export const LightspeedChatBoxHeader = ({
  selectedModel,
  handleSelectedModel,
  models,
}: LightspeedChatBoxHeaderProps) => {
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
  );
};
