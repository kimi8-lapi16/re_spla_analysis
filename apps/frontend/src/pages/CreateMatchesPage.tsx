import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Space, Spin, Table } from "antd";
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Spin size="large" />
        </div>
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
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>試合データ登録</h1>
          <p style={{ margin: "8px 0 0", color: "#666" }}>
            複数の試合を一度に登録できます。必要に応じて行を追加してください。
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Table
            dataSource={fields}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1300 }}
            bordered
          />

          <div style={{ marginTop: "16px" }}>
            <Button variant="secondary" icon={<PlusOutlined />} onClick={handleAddRow}>
              行を追加
            </Button>
          </div>

          {errors.matches && (
            <div style={{ marginTop: "16px", color: "#ff4d4f" }}>{errors.matches.message}</div>
          )}

          <Space style={{ marginTop: "24px" }}>
            <Button
              htmlType="submit"
              variant="primary"
              icon={<SaveOutlined />}
              disabled={isCreating}
            >
              {isCreating ? "登録中..." : "登録する"}
            </Button>
            <Button
              htmlType="button"
              variant="secondary"
              onClick={() => navigate({ to: "/matches" })}
              disabled={isCreating}
            >
              キャンセル
            </Button>
          </Space>
        </form>
      </div>
    </MainLayout>
  );
}
