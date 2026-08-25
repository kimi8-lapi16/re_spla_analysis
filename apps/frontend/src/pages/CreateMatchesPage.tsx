import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Skeleton, Space, Table, Typography } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { CreateMatchBody } from "../api";
import { Button } from "../components/base";
import { MatchSessionBar } from "../components/features/matches/MatchSessionBar";
import {
  createSessionMatchColumns,
  TIME_FORMAT,
  type MatchSessionFormData,
  type SessionMatchField,
} from "../components/features/matches/sessionMatchColumns";
import { MainLayout } from "../components/layout/MainLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { useNotification } from "../contexts/NotificationContext";
import { useBattleTypes } from "../hooks/useBattleType";
import { useBulkCreateMatches } from "../hooks/useMatch";
import { useRecentIds } from "../hooks/useRecentIds";
import { useRules } from "../hooks/useRule";
import { useStages } from "../hooks/useStage";
import { useWeapons } from "../hooks/useWeapon";
import { formatDateTimeAsJstIso } from "../utils/date";

const RECENT_WEAPONS_KEY = "spla:recent-weapon-ids";
const RECENT_STAGES_KEY = "spla:recent-stage-ids";
const LAST_SESSION_KEY = "spla:last-session";

const { Text } = Typography;

/**
 * Required-ness is expressed with `superRefine` rather than required field types
 * so the schema's output shape stays identical to the form's input shape - that
 * keeps one type for the whole form while still producing per-field messages.
 */
const matchSessionSchema = z
  .object({
    session: z.object({
      date: z.string().min(1, "日付を選択してください"),
      battleTypeId: z.number().optional(),
      ruleId: z.number().optional(),
      stageId: z.number().optional(),
    }),
    matches: z
      .array(
        z.object({
          id: z.string(),
          weaponId: z.number().optional(),
          stageId: z.number().optional(),
          result: z.enum(["WIN", "LOSE"]).optional(),
          time: z.string().optional(),
          point: z.number().min(0).optional().nullable(),
        })
      )
      .min(1, "最低1試合は入力してください"),
  })
  .superRefine((data, ctx) => {
    if (data.session.battleTypeId === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["session", "battleTypeId"],
        message: "バトルタイプを選択してください",
      });
    }
    if (data.session.ruleId === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["session", "ruleId"],
        message: "ルールを選択してください",
      });
    }
    data.matches.forEach((match, index) => {
      if (match.weaponId === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["matches", index, "weaponId"],
          message: "ブキを選択してください",
        });
      }
      if (match.stageId === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["matches", index, "stageId"],
          message: "ステージを選択してください",
        });
      }
      if (match.result === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["matches", index, "result"],
          message: "勝敗を選択してください",
        });
      }
      if (!match.time) {
        ctx.addIssue({
          code: "custom",
          path: ["matches", index, "time"],
          message: "時刻を入力してください",
        });
      }
    });
  });

/** A row that passed validation, narrowed without a type assertion. */
type CompleteMatch = SessionMatchField & {
  weaponId: number;
  stageId: number;
  result: "WIN" | "LOSE";
  time: string;
};

function isComplete(match: SessionMatchField): match is CompleteMatch {
  return (
    match.weaponId !== undefined &&
    match.stageId !== undefined &&
    match.result !== undefined &&
    typeof match.time === "string" &&
    match.time.length > 0
  );
}

/** Battle type / rule / stage carry over to the next visit; the date does not. */
type StoredSession = { battleTypeId?: number; ruleId?: number; stageId?: number };

function readStoredSession(): StoredSession {
  try {
    const raw = window.localStorage.getItem(LAST_SESSION_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const asRecord: Record<string, unknown> = { ...parsed };
    const pick = (key: string): number | undefined => {
      const value = asRecord[key];
      return typeof value === "number" ? value : undefined;
    };
    return {
      battleTypeId: pick("battleTypeId"),
      ruleId: pick("ruleId"),
      stageId: pick("stageId"),
    };
  } catch {
    return {};
  }
}

function writeStoredSession(session: StoredSession): void {
  try {
    window.localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable - the next visit just starts empty.
  }
}

function newRow(overrides: Partial<SessionMatchField> = {}): SessionMatchField {
  return {
    id: crypto.randomUUID(),
    weaponId: undefined,
    stageId: undefined,
    result: undefined,
    // Defaults to now, so logging as you play needs no date picker at all.
    time: dayjs().format(TIME_FORMAT),
    point: undefined,
    ...overrides,
  };
}

export function CreateMatchesPage() {
  const navigate = useNavigate();
  const notification = useNotification();

  const { data: weapons, isLoading: isLoadingWeapons } = useWeapons();
  const { data: stages, isLoading: isLoadingStages } = useStages();
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const { data: battleTypes, isLoading: isLoadingBattleTypes } = useBattleTypes();
  const { mutate: createMatches, isPending: isCreating } = useBulkCreateMatches();

  const { recentIds: recentWeaponIds, remember: rememberWeapons } =
    useRecentIds(RECENT_WEAPONS_KEY);
  const { recentIds: recentStageIds, remember: rememberStages } = useRecentIds(RECENT_STAGES_KEY);

  const storedSession = useMemo(readStoredSession, []);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<MatchSessionFormData>({
    resolver: zodResolver(matchSessionSchema),
    defaultValues: {
      session: {
        date: dayjs().format("YYYY-MM-DD"),
        battleTypeId: storedSession.battleTypeId,
        ruleId: storedSession.ruleId,
        stageId: storedSession.stageId,
      },
      matches: [newRow({ stageId: storedSession.stageId })],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "matches" });

  const isLoading = isLoadingWeapons || isLoadingStages || isLoadingRules || isLoadingBattleTypes;

  // Choosing the session stage fills rows that have none yet. Rows where a stage
  // was already picked are left alone - this seeds blanks, it does not overwrite.
  const handleSessionStageChange = (stageId: number) => {
    getValues().matches.forEach((match, index) => {
      if (match.stageId === undefined) {
        setValue(`matches.${index}.stageId`, stageId, { shouldValidate: false });
      }
    });
  };

  // A new row copies the weapon and stage of the one above it: within a session
  // those usually repeat, so the common case needs only the win/loss tap.
  const handleAddRow = () => {
    const current = getValues();
    const previous = current.matches[current.matches.length - 1];
    append(
      newRow({
        weaponId: previous?.weaponId,
        stageId: previous?.stageId ?? current.session.stageId,
      })
    );
  };

  const onSubmit = (data: MatchSessionFormData) => {
    const { session } = data;
    const complete = data.matches.filter(isComplete);
    // The resolver already blocks both of these; this is what narrows the types.
    if (session.battleTypeId === undefined || session.ruleId === undefined) return;
    if (complete.length !== data.matches.length) return;

    const battleTypeId = session.battleTypeId;
    const ruleId = session.ruleId;

    const payload = {
      matches: complete.map((match) => ({
        weaponId: match.weaponId,
        stageId: match.stageId,
        ruleId,
        battleTypeId,
        result: match.result === "WIN" ? CreateMatchBody.result.WIN : CreateMatchBody.result.LOSE,
        gameDateTime: combineDateAndTime(session.date, match.time),
        point: match.point ?? undefined,
      })),
    };

    createMatches(payload, {
      onSuccess: () => {
        rememberWeapons(complete.map((match) => match.weaponId));
        rememberStages(complete.map((match) => match.stageId));
        writeStoredSession({ battleTypeId, ruleId, stageId: session.stageId });
        notification.success({
          title: "登録しました",
          description: `${payload.matches.length} 試合を登録しました`,
          placement: "topRight",
        });
        navigate({ to: "/matches" });
      },
      onError: (error) => {
        notification.error({
          title: "登録に失敗しました",
          description: error.message,
          placement: "topRight",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Flex vertical gap="large">
          <PageHeader title="試合を登録" />
          <Skeleton active paragraph={{ rows: 6 }} />
        </Flex>
      </MainLayout>
    );
  }

  const columns = createSessionMatchColumns({
    control,
    errors,
    fieldsLength: fields.length,
    remove,
    weapons,
    stages,
    recentWeaponIds,
    recentStageIds,
  });

  const rowErrorCount = Array.isArray(errors.matches) ? errors.matches.filter(Boolean).length : 0;

  return (
    <MainLayout>
      <Flex vertical gap="large">
        <PageHeader
          title="試合を登録"
          description="セッションの条件を上で決めると、あとは試合ごとにブキと勝敗だけで記録できます。"
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex vertical gap="large">
            <MatchSessionBar
              control={control}
              errors={errors}
              stages={stages}
              rules={rules}
              battleTypes={battleTypes}
              onStageChange={handleSessionStageChange}
            />

            <Table
              dataSource={fields}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
              scroll={{ x: "max-content" }}
              bordered
            />

            <Flex vertical align="flex-start" gap="middle">
              <Button intent="neutral" icon={<PlusOutlined />} onClick={handleAddRow}>
                試合を追加
              </Button>

              {rowErrorCount > 0 && (
                <Text type="danger">{rowErrorCount} 件の試合に未入力の項目があります</Text>
              )}
              {typeof errors.matches?.message === "string" && (
                <Text type="danger">{errors.matches.message}</Text>
              )}

              <Space>
                <Button
                  htmlType="submit"
                  intent="primary"
                  icon={<SaveOutlined />}
                  loading={isCreating}
                >
                  {fields.length} 試合を登録する
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
          </Flex>
        </form>
      </Flex>
    </MainLayout>
  );
}

/** "2026-08-24" + "21:30" -> the ISO string the API expects. */
function combineDateAndTime(date: string, time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  return formatDateTimeAsJstIso(dayjs(date).hour(hour).minute(minute).second(0));
}
