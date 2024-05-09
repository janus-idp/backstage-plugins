import { createAnnotatorAction } from '../annotator/annotator';

export const createScaffoldedFromAction = () => {
  return createAnnotatorAction(
    'catalog:scaffolded-from',
    'Creates a new `catalog:scaffolded-from` scaffolder action to update a catalog-info.yaml with the entityRef of the template that created it.',
    'Annotating catalog-info.yaml with template entityRef',
    {
      spec: {
        scaffoldedFrom: { readFromContext: 'templateInfo.entityRef' },
      },
    },
  );
};
