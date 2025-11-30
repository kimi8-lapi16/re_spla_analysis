import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  Col,
  Collapse,
  DatePicker,
  Empty,
  Flex,
  Form,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { SearchMatchesRequest } from "../api";
import { MainLayout } from "../components/layouts/MainLayout";
import { Button } from "../components/ui";
import {
  useBattleTypes,
  useRules,
  useSearchMatches,
  useStages,
  useWeapons,
} from "../hooks/useMatch";

const { Title } = Typography;

const { RangePicker } = DatePicker;

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

  const { data: weaponsData, isLoading: isLoadingWeapons } = useWeapons();
  const { data: stagesData, isLoading: isLoadingStages } = useStages();
  const { data: rulesData, isLoading: isLoadingRules } = useRules();
  const { data: battleTypesData, isLoading: isLoadingBattleTypes } = useBattleTypes();

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

  const isLoading = isLoadingWeapons || isLoadingStages || isLoadingRules || isLoadingBattleTypes;

  const weaponOptions =
    weaponsData?.weapons?.map((weapon) => ({
      label: weapon.name,
      value: weapon.id,
    })) || [];

  const stageOptions =
    stagesData?.stages?.map((stage) => ({
      label: stage.name,
      value: stage.id,
    })) || [];

  const ruleOptions =
    rulesData?.rules?.map((rule) => ({
      label: rule.name,
      value: rule.id,
    })) || [];

  const battleTypeOptions =
    battleTypesData?.battleTypes?.map((battleType) => ({
      label: battleType.name,
      value: battleType.id,
    })) || [];

  const resultOptions = [
    { label: "勝ち", value: "WIN" as const },
    { label: "負け", value: "LOSE" as const },
  ];

  const tableData =
    searchData?.matches?.map((match, index) => {
      const weapon = weaponsData?.weapons?.find((w) => w.id === match.weaponId);
      const stage = stagesData?.stages?.find((s) => s.id === match.stageId);
      const rule = rulesData?.rules?.find((r) => r.id === match.ruleId);
      const battleType = battleTypesData?.battleTypes?.find((bt) => bt.id === match.battleTypeId);

      return {
        key: match.id || index,
        gameDateTime: dayjs(match.gameDateTime).format("YYYY/MM/DD HH:mm"),
        rule: rule?.name || "-",
        stage: stage?.name || "-",
        weapon: weapon?.name || "-",
        battleType: battleType?.name || "-",
        result: match.result === "WIN" ? "勝ち" : "負け",
        point: match.point ?? "-",
      };
    }) || [];

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

        <Collapse
          defaultActiveKey={["filters"]}
          items={[
            {
              key: "filters",
              label: "検索条件",
              children: (
                <Form size="small" layout="vertical">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="武器">
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="選択"
                          options={weaponOptions}
                          loading={isLoadingWeapons}
                          value={filters.weapons}
                          onChange={(value) =>
                            setFilters((prev) => ({ ...prev, weapons: value, page: 1 }))
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="ステージ">
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="選択"
                          options={stageOptions}
                          loading={isLoadingStages}
                          value={filters.stages}
                          onChange={(value) =>
                            setFilters((prev) => ({ ...prev, stages: value, page: 1 }))
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="ルール">
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="選択"
                          options={ruleOptions}
                          loading={isLoadingRules}
                          value={filters.rules}
                          onChange={(value) =>
                            setFilters((prev) => ({ ...prev, rules: value, page: 1 }))
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="バトルタイプ">
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="選択"
                          options={battleTypeOptions}
                          loading={isLoadingBattleTypes}
                          value={filters.battleTypes}
                          onChange={(value) =>
                            setFilters((prev) => ({ ...prev, battleTypes: value, page: 1 }))
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="勝敗">
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="選択"
                          options={resultOptions}
                          value={filters.results}
                          onChange={(value) =>
                            setFilters((prev) => ({ ...prev, results: value, page: 1 }))
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="日付範囲">
                        <RangePicker
                          showTime
                          value={filters.dateRange}
                          onChange={(dates) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: dates as [Dayjs, Dayjs] | undefined,
                              page: 1,
                            }))
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item label="検索条件">
                        <Radio.Group
                          value={filters.operator}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, operator: e.target.value, page: 1 }))
                          }
                        >
                          <Radio value={SearchMatchesRequest.operator.AND}>AND</Radio>
                          <Radio value={SearchMatchesRequest.operator.OR}>OR</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ),
            },
          ]}
        />

        <Spin spinning={isSearching || isLoading}>
          <Table
            dataSource={tableData}
            columns={[
              { title: "日時", dataIndex: "gameDateTime", key: "gameDateTime", width: 150 },
              { title: "ルール", dataIndex: "rule", key: "rule", width: 120 },
              { title: "ステージ", dataIndex: "stage", key: "stage", width: 150 },
              { title: "武器", dataIndex: "weapon", key: "weapon", width: 150 },
              { title: "バトルタイプ", dataIndex: "battleType", key: "battleType", width: 120 },
              { title: "勝敗", dataIndex: "result", key: "result", width: 80 },
              { title: "ポイント", dataIndex: "point", key: "point", width: 100 },
            ]}
            scroll={{ y: "calc(100vh - 480px)" }}
            locale={{
              emptyText: (
                <Empty description="試合データがありません" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ),
            }}
            pagination={{
              current: filters.page,
              pageSize: filters.pageCount,
              total: searchData?.total || 0,
              showSizeChanger: false,
              onChange: (page) => setFilters((prev) => ({ ...prev, page })),
            }}
          />
        </Spin>
      </Space>
    </MainLayout>
  );
}
