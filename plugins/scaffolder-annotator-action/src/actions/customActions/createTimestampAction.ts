import { getCurrentTimestamp } from '../../utils/getCurrentTimestamp';
import { createAnnotatorAction } from '../annotator/annotator';

export const createTimestampAction = () => {
  return createAnnotatorAction(
    'catalog:timestamping',
    'Creates a new `catalog:timestamping` Scaffolder action to annotate scaffolded entities with creation timestamp.',
    'Annotating catalog-info.yaml with current timestamp',
    { annotations: { 'backstage.io/createdAt': getCurrentTimestamp() } },
  );
};
