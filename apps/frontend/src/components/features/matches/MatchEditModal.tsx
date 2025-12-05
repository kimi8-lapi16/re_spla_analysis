import { SaveOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flex, Modal, Spin, Table } from "antd";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import type { MatchResponse } from "../../../api";
import { UpdateMatchBody } from "../../../api";
import { useBattleTypes } from "../../../hooks/useBattleType";
import { useRules } from "../../../hooks/useRule";
import { useStages } from "../../../hooks/useStage";
import { useWeapons } from "../../../hooks/useWeapon";
import { Button } from "../../base";
import { createMatchFormColumns, type MatchFormData } from "./matchFormColumns";

const matchEditSchema = z.object({
  matches: z.array(
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
  ),
});

type MatchEditModalProps = {
  open: boolean;
  matches: MatchResponse[];
  isUpdating: boolean;
  onSave: (matches: UpdateMatchBody[]) => void;
  onCancel: () => void;
};

function isWinOrLose(result: string): result is "WIN" | "LOSE" {
  return result === "WIN" || result === "LOSE";
}

function toIsoString(value: string | Date): string {
  if (typeof value === "string") {
    return value;
  }
  return value.toISOString();
}

export function MatchEditModal({
  open,
  matches,
  isUpdating,
  onSave,
  onCancel,
}: MatchEditModalProps) {
  const { data: weapons, isLoading: isLoadingWeapons } = useWeapons();
  const { data: stages, isLoading: isLoadingStages } = useStages();
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const { data: battleTypes, isLoading: isLoadingBattleTypes } = useBattleTypes();

  // Derive initial values from matches prop
  const initialValues = useMemo((): MatchFormData => {
    if (!open || matches.length === 0) {
      return { matches: [] };
    }
    return {
      matches: matches.map((match) => ({
        id: match.id,
        weaponId: match.weaponId,
        stageId: match.stageId,
        ruleId: match.ruleId,
        battleTypeId: match.battleTypeId,
        result: isWinOrLose(match.result) ? match.result : undefined,
        gameDateTime: toIsoString(match.gameDateTime),
        point: match.point,
      })),
    };
  }, [open, matches]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchEditSchema),
    values: initialValues,
  });

  const { fields, remove } = useFieldArray({
    control,
    name: "matches",
  });

  const isLoading = isLoadingWeapons || isLoadingStages || isLoadingRules || isLoadingBattleTypes;

  const onSubmit = (data: MatchFormData) => {
    const payload: UpdateMatchBody[] = data.matches
      .filter(
        (
          match
        ): match is typeof match & {
          id: string;
          weaponId: number;
          stageId: number;
          ruleId: number;
          battleTypeId: number;
          result: "WIN" | "LOSE";
          gameDateTime: string;
        } =>
          match.id !== undefined &&
          match.weaponId !== undefined &&
          match.stageId !== undefined &&
          match.ruleId !== undefined &&
          match.battleTypeId !== undefined &&
          match.result !== undefined &&
          isWinOrLose(match.result) &&
          match.gameDateTime !== undefined
      )
      .map((match) => ({
        id: match.id,
        weaponId: match.weaponId,
        stageId: match.stageId,
        ruleId: match.ruleId,
        battleTypeId: match.battleTypeId,
        result: match.result === "WIN" ? UpdateMatchBody.result.WIN : UpdateMatchBody.result.LOSE,
        gameDateTime: match.gameDateTime,
        point: match.point ?? undefined,
      }));

    if (payload.length === 0) {
      return;
    }

    onSave(payload);
  };

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
    <Modal
      title="試合データの編集"
      open={open}
      onCancel={onCancel}
      width={1400}
      footer={null}
      destroyOnHidden
    >
      {isLoading ? (
        <Flex>
          <Spin size="large" />
        </Flex>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Table
            dataSource={fields}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1300, y: 400 }}
            bordered
          />
          <Flex justify="flex-end" align="center" gap={"middle"} style={{ marginTop: "24px" }}>
            <Button htmlType="button" variant="secondary" onClick={onCancel} disabled={isUpdating}>
              キャンセル
            </Button>
            <Button
              htmlType="submit"
              variant="primary"
              icon={<SaveOutlined />}
              disabled={isUpdating}
            >
              {isUpdating ? "保存中..." : "保存する"}
            </Button>
          </Flex>
        </form>
      )}
    </Modal>
  );
}
