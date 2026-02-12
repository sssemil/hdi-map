import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createValueLoader } from './value-loader';
import { getMockHdiRegionValue } from './schemas/hdi-values.schema';
import { getMockWhrRegionValue } from './schemas/whr-values.schema';

const mockHdiValues = {
  GBRr101: getMockHdiRegionValue(),
  INDr101: getMockHdiRegionValue({ hdi: 0.650, year: 2021 }),
};

const mockWhrValues = {
  FIN: getMockWhrRegionValue({ score: 7.736 }),
  AFG: getMockWhrRegionValue({ score: 1.364 }),
};

const stubFetchSuccess = (data: unknown): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};

const stubFetchFailure = (status: number, statusText: string): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      statusText,
    })
  );
};

const stubFetchNetworkError = (): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new Error('Network error'))
  );
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('createValueLoader', () => {
  it('should fetch and return HDI values', async () => {
    stubFetchSuccess(mockHdiValues);
    const loader = createValueLoader();
    const values = await loader.loadValues('hdi');
    expect(values).toEqual(mockHdiValues);
  });

  it('should fetch and return WHR values', async () => {
    stubFetchSuccess(mockWhrValues);
    const loader = createValueLoader();
    const values = await loader.loadValues('whr');
    expect(values).toEqual(mockWhrValues);
  });

  it('should cache values after first fetch', async () => {
    stubFetchSuccess(mockHdiValues);
    const loader = createValueLoader();

    await loader.loadValues('hdi');
    await loader.loadValues('hdi');

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should return cached values from getCachedValues after loading', async () => {
    stubFetchSuccess(mockHdiValues);
    const loader = createValueLoader();

    expect(loader.getCachedValues('hdi')).toBeNull();

    await loader.loadValues('hdi');

    expect(loader.getCachedValues('hdi')).toEqual(mockHdiValues);
  });

  it('should return null from getCachedValues for unloaded index', () => {
    const loader = createValueLoader();
    expect(loader.getCachedValues('whr')).toBeNull();
  });

  it('should fetch different indices independently', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockHdiValues) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockWhrValues) });
    vi.stubGlobal('fetch', fetchMock);

    const loader = createValueLoader();

    await loader.loadValues('hdi');
    await loader.loadValues('whr');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(loader.getCachedValues('hdi')).toEqual(mockHdiValues);
    expect(loader.getCachedValues('whr')).toEqual(mockWhrValues);
  });

  it('should throw on fetch failure', async () => {
    stubFetchFailure(404, 'Not Found');
    const loader = createValueLoader();

    await expect(loader.loadValues('hdi')).rejects.toThrow(/failed to load/i);
  });

  it('should throw on network error', async () => {
    stubFetchNetworkError();
    const loader = createValueLoader();

    await expect(loader.loadValues('hdi')).rejects.toThrow(/network/i);
  });

  it('should throw on invalid data', async () => {
    stubFetchSuccess({ BAD: { invalid: true } });
    const loader = createValueLoader();

    await expect(loader.loadValues('hdi')).rejects.toThrow(/validation/i);
  });

  it('should not cache failed requests', async () => {
    stubFetchFailure(500, 'Server Error');
    const loader = createValueLoader();

    await expect(loader.loadValues('hdi')).rejects.toThrow();
    expect(loader.getCachedValues('hdi')).toBeNull();

    stubFetchSuccess(mockHdiValues);
    const values = await loader.loadValues('hdi');
    expect(values).toEqual(mockHdiValues);
  });

  it('should use index dataUrl from registry', async () => {
    stubFetchSuccess(mockHdiValues);
    const loader = createValueLoader();

    await loader.loadValues('hdi');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('hdi-values.json'));
  });
});
