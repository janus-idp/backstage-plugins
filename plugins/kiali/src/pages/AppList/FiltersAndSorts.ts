import { ObjectReference } from '../../types/IstioObjects';

export const compareObjectReference = (
  a: ObjectReference,
  b: ObjectReference,
): number => {
  const cmpObjectType = a.objectType.localeCompare(b.objectType);
  if (cmpObjectType !== 0) {
    return cmpObjectType;
  }
  const cmpName = a.name.localeCompare(b.name);
  if (cmpName !== 0) {
    return cmpName;
  }

  return a.namespace.localeCompare(b.namespace);
};

// It assumes that is sorted
export const compareObjectReferences = (
  a: ObjectReference[],
  b: ObjectReference[],
): number => {
  if (a.length === 0 && b.length === 0) {
    return 0;
  }
  if (a.length === 0 && b.length > 0) {
    return -1;
  }
  if (a.length > 0 && b.length === 0) {
    return 1;
  }
  if (a.length !== b.length) {
    return a.length - b.length;
  }
  for (let i = 0; i < a.length; i++) {
    const cmp = compareObjectReference(a[i], b[i]);
    if (cmp !== 0) {
      return cmp;
    }
  }
  return 0;
};

// Remove duplicates and sort references
export const sortIstioReferences = (
  unsorted: ObjectReference[],
  isAscending: boolean,
): ObjectReference[] => {
  const unique = unsorted.filter(
    (item, index) => unsorted.indexOf(item) === index,
  );
  return unique.sort((a, b) => {
    return isAscending
      ? compareObjectReference(a, b)
      : compareObjectReference(b, a);
  });
};
