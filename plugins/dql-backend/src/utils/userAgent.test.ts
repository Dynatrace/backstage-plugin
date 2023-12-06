describe('user-agent', () => {
  beforeEach(() => jest.resetModules());

  it('should return user agent', async () => {
    jest.doMock('../../package.json', () => ({
      name: 'dql-backend',
      version: '1.0.0',
    }));

    const userAgentModule = await import('./userAgent');
    const getUserAgent = userAgentModule.getUserAgent;

    expect(getUserAgent()).toBe('dql-backend/1.0.0');
  });

  it('should return a sensible default user agent when no data is available', async () => {
    jest.doMock('../../package.json', () => ({}));

    const userAgentModule = await import('./userAgent');
    const getUserAgent = userAgentModule.getUserAgent;

    expect(getUserAgent()).toBe('DynatraceDQLPlugin/0.0.0');
  });
});
