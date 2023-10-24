import { createRouter } from './router';
import { getVoidLogger } from '@backstage/backend-common';
import { MockConfigApi } from '@backstage/test-utils';
import express from 'express';

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: new MockConfigApi({}),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should not fail because of missing tests', () => {
    expect(app).toBeDefined();
  });
});
