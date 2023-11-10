import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

describe('dtFetch', () => {
  beforeAll(() => server.listen());
  beforeEach(() => jest.resetModules());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should set the user-agent header', async () => {
    jest.doMock('../../package.json', () => ({
      name: 'dql-backend',
      version: '1.0.0',
    }));

    server.use(
      rest.get('*', (req, res, ctx) => {
        return res(
          ctx.json({
            userAgent: req.headers.get('user-agent'),
          }),
        );
      }),
    );

    const dtFetchModule = await import('./dt-fetch');
    const dtFetch = dtFetchModule.dtFetch;

    const resp = await dtFetch('http://localhost:3000');
    const jsonData = await resp.json();

    expect(jsonData.userAgent).toBe('dql-backend/1.0.0');
  });
});
