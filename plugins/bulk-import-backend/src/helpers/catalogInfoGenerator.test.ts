import { getVoidLogger } from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';

import { CatalogInfoGenerator } from './catalogInfoGenerator';

const logger = getVoidLogger();
const errorLog = jest.spyOn(logger, 'error');

const mockValidateEntity = jest.fn();
const mockGetEntitiesByRefs = jest.fn();

const mockCatalogClient = {
  getEntitiesByRefs: mockGetEntitiesByRefs,
  validateEntity: mockValidateEntity,
} as unknown as CatalogClient;

describe('catalogInfoGenerator', () => {
  let catalogInfoCreator: CatalogInfoGenerator;
  beforeAll(() => {
    catalogInfoCreator = new CatalogInfoGenerator(logger, mockCatalogClient);
  });

  it('should sanitize strings to adhere to backstage entity name rules', async () => {
    const noopSanitize = catalogInfoCreator.sanitizeEntityInput('test');
    const empty = catalogInfoCreator.sanitizeEntityInput('');
    const long = catalogInfoCreator.sanitizeEntityInput('a'.repeat(64));
    const specialChars = catalogInfoCreator.sanitizeEntityInput(
      "!@#$%^&A-._%'{P]23hy*()_+",
    );
    const allSpecialChars =
      catalogInfoCreator.sanitizeEntityInput('!@#$%^&*()_+');
    // If truncated to 63 characters, this would end with a `-` which should be removed
    const dashInTheEnd = catalogInfoCreator.sanitizeEntityInput(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghij-klmnop',
    );

    expect(noopSanitize).toBe('test');
    expect(empty).toBe('default-entity');
    expect(long).toBe('a'.repeat(63));
    expect(specialChars).toBe('A-._---P-23hy');
    expect(allSpecialChars).toBe('default-entity');
    expect(dashInTheEnd).toBe(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghij',
    );
  });
});
