import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Space, Typography } from "antd";
import { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import type { MatchResponse, UpdateMatchBody } from "../api";
import { SearchMatchesRequest } from "../api";
import { Button } from "../components/base";
import { MatchDeleteConfirmModal } from "../components/features/matches/MatchDeleteConfirmModal";
import { MatchEditModal } from "../components/features/matches/MatchEditModal";
import { MatchSearchFilters } from "../components/features/matches/MatchSearchFilters";
import { MatchTable } from "../components/features/matches/MatchTable";
import { MainLayout } from "../components/layout/MainLayout";
import { useNotification } from "../contexts/NotificationContext";
import { useBulkUpdateMatches, useSearchMatches } from "../hooks/useMatch";

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
  const queryClient = useQueryClient();
  const notification = useNotification();

  const [filters, setFilters] = useState<SearchFilters>({
    operator: SearchMatchesRequest.operator.AND,
    page: 1,
    pageCount: 50,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<MatchResponse[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
  const { mutate: updateMatches, isPending: isUpdating } = useBulkUpdateMatches();

  const handleCreateNew = () => {
    navigate({ to: "/matches/new" });
  };

  const handleFiltersChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSelectionChange = (keys: string[], rows: MatchResponse[]) => {
    setSelectedRowKeys(keys);
    setSelectedMatches(rows);
  };

  const handleEditClick = () => {
    if (selectedMatches.length === 0) return;
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    if (selectedRowKeys.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const handleEditSave = (matches: UpdateMatchBody[]) => {
    updateMatches(
      { matches },
      {
        onSuccess: () => {
          notification.success({
            title: "更新成功",
            message: "更新成功",
            description: "試合データを更新しました",
            placement: "topRight",
          });
          setIsEditModalOpen(false);
          setSelectedRowKeys([]);
          setSelectedMatches([]);
          queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
        onError: (error) => {
          notification.error({
            title: "更新失敗",
            message: "更新失敗",
            description: `更新に失敗しました: ${error.message}`,
            placement: "topRight",
          });
        },
      }
    );
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedRowKeys([]);
    setSelectedMatches([]);
  };

  return (
    <MainLayout>
      <Space vertical size="large">
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>
            試合履歴
          </Title>
          <Space>
            {selectedRowKeys.length > 0 && (
              <>
                <Button variant="secondary" icon={<EditOutlined />} onClick={handleEditClick}>
                  編集 ({selectedRowKeys.length})
                </Button>
                <Button
                  variant="secondary"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteClick}
                  style={{ color: "#ff4d4f", borderColor: "#ff4d4f" }}
                >
                  削除 ({selectedRowKeys.length})
                </Button>
              </>
            )}
            <Button variant="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
              新規登録
            </Button>
          </Space>
        </Flex>
        <MatchSearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
        <MatchTable
          matches={searchData?.matches}
          isLoading={isSearching}
          pagination={{
            current: filters.page,
            pageSize: filters.pageCount,
            total: searchData?.total ?? 0,
            onChange: (page) => setFilters((prev) => ({ ...prev, page })),
          }}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
        />
      </Space>
      <MatchEditModal
        open={isEditModalOpen}
        matches={selectedMatches}
        isUpdating={isUpdating}
        onSave={handleEditSave}
        onCancel={() => setIsEditModalOpen(false)}
      />
      <MatchDeleteConfirmModal
        open={isDeleteModalOpen}
        matchIds={selectedRowKeys}
        onSuccess={handleDeleteSuccess}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </MainLayout>
  );
}
