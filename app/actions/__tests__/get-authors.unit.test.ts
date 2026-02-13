import { getDistinctAuthors } from '../get-authors';

const mockSelect = jest.fn();
const mockNot = jest.fn();
const mockNeq = jest.fn();
const mockIs = jest.fn();
const mockOrder = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      from: (table: string) => {
        expect(table).toBe('songs');
        return {
          select: (col: string) => {
            mockSelect(col);
            return {
              not: (field: string, op: string, val: null) => {
                mockNot(field, op, val);
                return {
                  neq: (field2: string, val2: string) => {
                    mockNeq(field2, val2);
                    return {
                      is: (field3: string, val3: null) => {
                        mockIs(field3, val3);
                        return {
                          order: (col2: string) => {
                            mockOrder(col2);
                            return Promise.resolve({
                              data: [
                                { author: 'Queen' },
                                { author: 'Led Zeppelin' },
                                { author: 'Queen' },
                              ],
                              error: null,
                            });
                          },
                        };
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    })
  ),
}));

describe('getDistinctAuthors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns deduplicated author names', async () => {
    const result = await getDistinctAuthors();

    expect(result).toEqual(['Queen', 'Led Zeppelin']);
  });

  it('queries songs table with correct filters', async () => {
    await getDistinctAuthors();

    expect(mockSelect).toHaveBeenCalledWith('author');
    expect(mockNot).toHaveBeenCalledWith('author', 'is', null);
    expect(mockNeq).toHaveBeenCalledWith('author', '');
    expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
    expect(mockOrder).toHaveBeenCalledWith('author');
  });
});
