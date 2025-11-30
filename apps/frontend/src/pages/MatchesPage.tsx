import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Space, Typography } from "antd";
import { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { SearchMatchesRequest } from "../api";
import { MatchSearchFilters } from "../components/MatchSearchFilters";
import { MatchTable } from "../components/MatchTable";
import { MainLayout } from "../components/layouts/MainLayout";
import { Button } from "../components/ui";
import { useSearchMatches } from "../hooks/useMatch";

const { Title } = Typography;

type SearchFilters = {
  weapons?: number[];
  stages?: number[];
  rules?: number[];
  battleTypes?: number[];
  results?: Array<"WIN" | "LOSE">;
  dateRange?: [Dayjs, Dayjs];
  operator: SearchMatchesRequest.operator;
  page: number;
  pageCount: number;
};

export function MatchesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    operator: SearchMatchesRequest.operator.AND,
    page: 1,
    pageCount: 50,
  });

  const searchParams = useMemo(
    () => ({
      weapons: filters.weapons,
      stages: filters.stages,
      rules: filters.rules,
      battleTypes: filters.battleTypes,
      results: filters.results,
      startDateTime: filters.dateRange?.[0]?.toISOString(),
      endDateTime: filters.dateRange?.[1]?.toISOString(),
      operator: filters.operator,
      page: filters.page,
      pageCount: filters.pageCount,
    }),
    [filters]
  );

  const { data: searchData, isLoading: isSearching } = useSearchMatches(searchParams);

  const handleCreateNew = () => {
    navigate({ to: "/matches/new" });
  };

  const handleFiltersChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <MainLayout>
      <Space vertical size="large" style={{ display: "flex", padding: 24 }}>
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>
            試合履歴
          </Title>
          <Button variant="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            新規登録
          </Button>
        </Flex>
        <MatchSearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
        <MatchTable
          matches={searchData?.matches}
          isLoading={isSearching}
          pagination={{
            current: filters.page,
            pageSize: filters.pageCount,
            total: searchData?.total || 0,
            onChange: (page) => setFilters((prev) => ({ ...prev, page })),
          }}
        />
      </Space>
    </MainLayout>
  );
}
