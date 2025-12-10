import { useCallback, useState } from "react";

export type SortOrder = "asc" | "desc";

export type TableState<TSortBy extends string> = {
  page: number;
  pageSize: number;
  sortBy: TSortBy;
  sortOrder: SortOrder;
};

export type UseTableStateOptions<TSortBy extends string> = {
  defaultSortBy: TSortBy;
  defaultSortOrder?: SortOrder;
  pageSize?: number;
};

export type UseTableStateReturn<TSortBy extends string> = {
  tableState: TableState<TSortBy>;
  setTableState: (state: TableState<TSortBy>) => void;
  resetPage: () => void;
};

const DEFAULT_PAGE_SIZE = 20;

export function useTableState<TSortBy extends string>(
  options: UseTableStateOptions<TSortBy>
): UseTableStateReturn<TSortBy> {
  const {
    defaultSortBy,
    defaultSortOrder = "desc",
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  const [tableState, setTableStateInternal] = useState<TableState<TSortBy>>({
    page: 1,
    pageSize,
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder,
  });

  const setTableState = useCallback((state: TableState<TSortBy>) => {
    setTableStateInternal(state);
  }, []);

  const resetPage = useCallback(() => {
    setTableStateInternal((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    tableState,
    setTableState,
    resetPage,
  };
}
