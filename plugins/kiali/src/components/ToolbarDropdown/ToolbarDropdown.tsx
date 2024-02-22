import * as React from 'react';

import { MenuItem, Select, Tooltip } from '@material-ui/core';

import { kialiStyle } from '../../styles/StyleUtils';

const dropdownTitle = kialiStyle({
  marginRight: '10px',
  alignSelf: 'center',
});

type ToolbarDropdownProps = {
  className?: string;
  disabled?: boolean;
  id: string;
  label?: string;
  nameDropdown?: string;
  options: object;
  tooltip?: string;
  tooltipPosition?: string;
  value?: number | string;

  handleSelect: (value: string) => void;
  onToggle?: (isOpen: boolean) => void;
};

export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = (
  props: ToolbarDropdownProps,
) => {
  const onKeyChanged = (_event: object, child?: React.ReactNode) => {
    if (child) {
      // @ts-ignore
      props.handleSelect(String(child.props.value));
    }
  };

  const dropdownButton = (
    <Select
      aria-label={props.id}
      value={props.value}
      id={props.id}
      data-test={props.id}
      aria-labelledby={props.id}
      onChange={onKeyChanged}
    >
      {Object.keys(props.options).map(key => {
        return (
          <MenuItem
            id={key}
            key={key}
            disabled={props.disabled}
            selected={key === String(props.value)}
            value={`${key}`}
          >
            {
              // @ts-ignore
              props.options[key]
            }
          </MenuItem>
        );
      })}
    </Select>
  );
  return (
    <>
      {props.nameDropdown && (
        <span className={dropdownTitle}>{props.nameDropdown}</span>
      )}
      {props.tooltip ? (
        <Tooltip key={`ot-${props.id}`} title={<>{props.tooltip}</>}>
          {dropdownButton}
        </Tooltip>
      ) : (
        dropdownButton
      )}
    </>
  );
};
