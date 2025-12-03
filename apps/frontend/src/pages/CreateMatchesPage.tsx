import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  Button as AntButton,
  DatePicker,
  InputNumber,
  Radio,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import dayjs from "dayjs";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { MatchData } from "../api";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/base";
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
        weaponId: z.number().optional(),
        stageId: z.number().optional(),
        ruleId: z.number().optional(),
        battleTypeId: z.number().optional(),
        result: z.enum(["WIN", "LOSE"]).optional(),
        gameDateTime: z.string().optional(),
        point: z.number().min(0).optional(),
      })
    )
    .min(1, "最低1試合は入力してください"),
});

type MatchFormData = z.infer<typeof matchSchema>;

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
    // Validate and filter out incomplete rows
    const validMatches = data.matches.filter(
      (match) =>
        match.weaponId &&
        match.stageId &&
        match.ruleId &&
        match.battleTypeId &&
        match.result &&
        match.gameDateTime
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

    // Convert to API format
    const payload = {
      matches: validMatches.map((match) => ({
        weaponId: match.weaponId!,
        stageId: match.stageId!,
        ruleId: match.ruleId!,
        battleTypeId: match.battleTypeId!,
        result: match.result! as MatchData.result,
        gameDateTime: match.gameDateTime!,
        point: match.point,
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

  const columns = [
    {
      title: "ブキ",
      dataIndex: "weaponId",
      key: "weaponId",
      width: 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.weaponId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={errors.matches?.[index]?.weaponId ? "error" : ""}
              showSearch
              optionFilterProp="label"
              options={weapons?.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
            />
          )}
        />
      ),
    },
    {
      title: "ステージ",
      dataIndex: "stageId",
      key: "stageId",
      width: 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.stageId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={errors.matches?.[index]?.stageId ? "error" : ""}
              showSearch
              optionFilterProp="label"
              options={stages?.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          )}
        />
      ),
    },
    {
      title: "ルール",
      dataIndex: "ruleId",
      key: "ruleId",
      width: 150,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.ruleId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={errors.matches?.[index]?.ruleId ? "error" : ""}
              options={rules?.map((r) => ({
                value: r.id,
                label: r.name,
              }))}
            />
          )}
        />
      ),
    },
    {
      title: "バトル",
      dataIndex: "battleTypeId",
      key: "battleTypeId",
      width: 150,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.battleTypeId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={errors.matches?.[index]?.battleTypeId ? "error" : ""}
              options={battleTypes?.map((bt) => ({
                value: bt.id,
                label: bt.name,
              }))}
            />
          )}
        />
      ),
    },
    {
      title: "勝敗",
      dataIndex: "result",
      key: "result",
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.result`}
          control={control}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Radio value="WIN">勝ち</Radio>
              <Radio value="LOSE">負け</Radio>
            </Radio.Group>
          )}
        />
      ),
    },
    {
      title: "日時",
      dataIndex: "gameDateTime",
      key: "gameDateTime",
      width: 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.gameDateTime`}
          control={control}
          render={({ field }) => (
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              placeholder="日時を選択"
              status={errors.matches?.[index]?.gameDateTime ? "error" : ""}
              value={field.value ? dayjs(field.value) : null}
              onChange={(date) => {
                if (!date) {
                  field.onChange("");
                  return;
                }
                // Get local date/time components and format as JST
                const year = date.year();
                const month = String(date.month() + 1).padStart(2, "0");
                const day = String(date.date()).padStart(2, "0");
                const hour = String(date.hour()).padStart(2, "0");
                const minute = String(date.minute()).padStart(2, "0");
                const second = String(date.second()).padStart(2, "0");
                field.onChange(`${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`);
              }}
            />
          )}
        />
      ),
    },
    {
      title: "ポイント",
      dataIndex: "point",
      key: "point",
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.point`}
          control={control}
          render={({ field }) => (
            <InputNumber {...field} style={{ width: "100%" }} placeholder="任意" min={0} />
          )}
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 80,
      fixed: "right" as const,
      render: (_: unknown, __: unknown, index: number) => (
        <AntButton
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => remove(index)}
          disabled={fields.length === 1}
        />
      ),
    },
  ];

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
