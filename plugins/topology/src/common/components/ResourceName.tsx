import React from 'react';

import classNames from 'classnames';

import { MEMO } from '../../const';
import { resourceModels } from '../../models';
import { kindToAbbr } from '../utils/getResources';

import './ResourceName.css';

export type ResourceIconProps = {
  className?: string;
  kind: string;
};

export const ResourceIcon = ({ className, kind }: ResourceIconProps) => {
  // if no kind, return null so an empty icon isn't rendered
  if (!kind) {
    return null;
  }
  const kindObj = resourceModels[kind];
  const kindStr = kindObj?.kind || kind;
  const memoKey = className ? `${kind}/${className}` : kind;
  if (MEMO[memoKey]) {
    return MEMO[memoKey];
  }

  const backgroundColor = kindObj?.color;
  const klass = classNames(
    `bs-topology-resource-icon bs-topology-resource-${kindStr.toLowerCase()}`,
    className,
  );
  const iconLabel = kindObj?.abbr || kindToAbbr(kindStr);

  const rendered = (
    <span className={klass} title={kindStr} style={{ backgroundColor }}>
      {iconLabel}
    </span>
  );
  if (kindObj) {
    MEMO[memoKey] = rendered;
  }

  return rendered;
};

export type ResourceNameProps = {
  kind: string;
  name: React.ReactNode;
  large?: boolean;
};

export const ResourceName = ({ kind, name, large }: ResourceNameProps) => (
  <span className="bs-topology-resource-item">
    <ResourceIcon
      kind={kind}
      className={large ? 'bs-topology-resource-icon--lg' : ''}
    />{' '}
    <span
      className={
        large
          ? 'bs-topology-resource-item__resource-name--lg'
          : 'bs-topology-resource-item__resource-name'
      }
    >
      {name}
    </span>
  </span>
);

export default ResourceName;
