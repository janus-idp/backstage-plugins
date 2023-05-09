import React from 'react';

type WithScrollContainerProps = {
  children: (scrollContainer: HTMLElement) => React.ReactElement | null;
};

const isHTMLElement = (n: Node): n is HTMLElement => {
  return n.nodeType === Node.ELEMENT_NODE;
};

export const getParentScrollableElement = (node: HTMLElement) => {
  let parentNode = node;
  while (parentNode) {
    if (isHTMLElement(parentNode)) {
      let overflow = parentNode.style?.overflow;
      if (!overflow.includes('scroll') && !overflow.includes('auto')) {
        overflow = window.getComputedStyle(parentNode).overflow;
      }
      if (overflow.includes('scroll') || overflow.includes('auto')) {
        return parentNode;
      }
    }
    parentNode = parentNode.parentNode as HTMLElement;
  }
  return undefined;
};

export const WithScrollContainer = ({ children }: WithScrollContainerProps) => {
  const [scrollContainer, setScrollContainer] = React.useState<HTMLElement>();
  const ref = React.useCallback(node => {
    if (node) {
      setScrollContainer(getParentScrollableElement(node));
    }
  }, []);
  return scrollContainer ? children(scrollContainer) : <span ref={ref} />;
};
