const VALID_SORT_FIELDS = ['title', 'author', 'level', 'key', 'updated_at'] as const;
export type SortField = (typeof VALID_SORT_FIELDS)[number];

const DEFAULT_PAGE_SIZE = 25;
const MIN_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 100;

type RawParams = { [key: string]: string | string[] | undefined };

function str(params: RawParams | undefined, key: string): string | undefined {
  const val = params?.[key];
  return typeof val === 'string' ? val : undefined;
}

export function parseListParams(searchParams?: RawParams) {
  const studentId = str(searchParams, 'studentId');
  const search = str(searchParams, 'search');
  const level = str(searchParams, 'level');
  const key = str(searchParams, 'key');
  const category = str(searchParams, 'category');
  const author = str(searchParams, 'author');
  const showDrafts = searchParams?.showDrafts === 'true';

  // Pagination
  const rawPage = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const rawPageSize = typeof searchParams?.pageSize === 'string'
    ? parseInt(searchParams.pageSize, 10)
    : DEFAULT_PAGE_SIZE;
  const pageSize = Number.isFinite(rawPageSize)
    ? Math.min(Math.max(rawPageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  // Sort
  const sortByParam = str(searchParams, 'sortBy');
  const sortBy: SortField =
    sortByParam && (VALID_SORT_FIELDS as readonly string[]).includes(sortByParam)
      ? (sortByParam as SortField)
      : 'updated_at';
  const sortDirParam = str(searchParams, 'sortDir');
  const sortDir: 'asc' | 'desc' = sortDirParam === 'asc' ? 'asc' : 'desc';

  return {
    studentId, search, level, key, category, author, showDrafts,
    currentPage, pageSize, sortBy, sortDir,
  };
}
