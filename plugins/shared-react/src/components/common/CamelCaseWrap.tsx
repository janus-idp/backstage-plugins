import React from 'react';

const MEMO: { [key: string]: any } = {};

type CamelCaseWrapProps = {
  value: string;
  dataTest?: string;
};

export const CamelCaseWrap = ({ value, dataTest }: CamelCaseWrapProps) => {
  if (!value) {
    return '-';
  }

  if (MEMO[value]) {
    return MEMO[value];
  }

  // Add word break points before capital letters (but keep consecutive capital letters together).
  const words = value.match(/[A-Z]+[^A-Z]*|[^A-Z]+/g);
  const rendered = (
    <span data-testid={dataTest}>
      {words?.map((word, i) => (
        <React.Fragment key={word}>
          {word}
          {i !== words.length - 1 && <wbr />}
        </React.Fragment>
      ))}
    </span>
  );
  MEMO[value] = rendered;
  return rendered;
};

export default CamelCaseWrap;
