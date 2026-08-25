import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Space, Spin, Table, Typography } from "antd";
import { PageHeader } from "../components/layout/PageHeader";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { CreateMatchBody } from "../api";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/base";
import {
  createMatchFormColumns,
  type MatchFormData,
} from "../components/features/matches/matchFormColumns";
import { useNotification } from "../contexts/NotificationContext";
import { useBattleTypes } from "../hooks/useBattleType";
import { useBulkCreateMatches } from "../hooks/useMatch";
import { useRules } from "../hooks/useRule";
import { useStages } from "../hooks/useStage";
import { useWeapons } from "../hooks/useWeapon";

const matchSchema = z.object({
  matches: z
    .array(
      z.object({
        id: z.string(),
        weaponId: z.number().optional(),
        stageId: z.number().optional(),
        ruleId: z.number().optional(),
        battleTypeId: z.number().optional(),
        result: z.enum(["WIN", "LOSE"]).optional(),
        gameDateTime: z.string().optional(),
        point: z.number().min(0).optional().nullable(),
      })
    )
    .min(1, "最低1試合は入力してください"),
});

const { Text } = Typography;

function isValidResult(result: string): result is CreateMatchBody.result {
  return result === "WIN" || result === "LOSE";
}

export function CreateMatchesPage() {
  const navigate = useNavigate();
  const notification = useNotification();

  const { data: weapons, isLoading: isLoadingWeapons } = useWeapons();
  const { data: stages, isLoading: isLoadingStages } = useStages();
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const { data: battleTypes, isLoading: isLoadingBattleTypes } = useBattleTypes();
  const { mutate: createMatches, isPending: isCreating } = useBulkCreateMatches();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      matches: [
        {
          id: crypto.randomUUID(),
          weaponId: undefined,
          stageId: undefined,
          ruleId: undefined,
          battleTypeId: undefined,
          result: undefined,
          gameDateTime: "",
          point: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "matches",
  });

  const isLoading = isLoadingWeapons || isLoadingStages || isLoadingRules || isLoadingBattleTypes;

  const onSubmit = (data: MatchFormData) => {
    // Validate and filter out incomplete rows using type guard
    const validMatches = data.matches.filter(
      (
        match
      ): match is typeof match & {
        weaponId: number;
        stageId: number;
        ruleId: number;
        battleTypeId: number;
        result: "WIN" | "LOSE";
        gameDateTime: string;
      } =>
        match.weaponId !== undefined &&
        match.stageId !== undefined &&
        match.ruleId !== undefined &&
        match.battleTypeId !== undefined &&
        match.result !== undefined &&
        isValidResult(match.result) &&
        match.gameDateTime !== undefined &&
        match.gameDateTime !== ""
    );

    if (validMatches.length === 0) {
      notification.error({
        title: "入力エラー",
        message: "入力エラー",
        description: "少なくとも1試合分の完全なデータを入力してください",
        placement: "topRight",
      });
      return;
    }

    // Convert to API format - map result to CreateMatchBody.result enum
    const payload = {
      matches: validMatches.map((match) => ({
        weaponId: match.weaponId,
        stageId: match.stageId,
        ruleId: match.ruleId,
        battleTypeId: match.battleTypeId,
        result: match.result === "WIN" ? CreateMatchBody.result.WIN : CreateMatchBody.result.LOSE,
        gameDateTime: match.gameDateTime,
        point: match.point ?? undefined,
      })),
    };

    createMatches(payload, {
      onSuccess: () => {
        notification.success({
          title: "登録成功",
          message: "登録成功",
          description: "試合データを登録しました",
          placement: "topRight",
        });
        navigate({ to: "/matches" });
      },
      onError: (error) => {
        notification.error({
          title: "登録失敗",
          message: "登録失敗",
          description: `登録に失敗しました: ${error.message}`,
          placement: "topRight",
        });
      },
    });
  };

  const handleAddRow = () => {
    append({
      id: crypto.randomUUID(),
      weaponId: undefined,
      stageId: undefined,
      ruleId: undefined,
      battleTypeId: undefined,
      result: undefined,
      gameDateTime: "",
      point: undefined,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" style={{ height: 400 }}>
          <Spin size="large" />
        </Flex>
      </MainLayout>
    );
  }

  const columns = createMatchFormColumns({
    control,
    errors,
    fieldsLength: fields.length,
    remove,
    weapons,
    stages,
    rules,
    battleTypes,
  });

  return (
    <MainLayout>
      <Flex vertical gap="large">
        <PageHeader
          title="試合データ登録"
          description="複数の試合を一度に登録できます。必要に応じて行を追加してください。"
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Table
            dataSource={fields}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1300 }}
            bordered
          />

          <Flex vertical align="flex-start" gap="middle" style={{ marginTop: 16 }}>
            <Button intent="neutral" icon={<PlusOutlined />} onClick={handleAddRow}>
              行を追加
            </Button>

            {errors.matches && <Text type="danger">{errors.matches.message}</Text>}

            <Space>
              <Button
                htmlType="submit"
                intent="primary"
                icon={<SaveOutlined />}
                loading={isCreating}
              >
                登録する
              </Button>
              <Button
                htmlType="button"
                intent="neutral"
                onClick={() => navigate({ to: "/matches" })}
                disabled={isCreating}
              >
                キャンセル
              </Button>
            </Space>
          </Flex>
        </form>
      </Flex>
    </MainLayout>
  );
}
