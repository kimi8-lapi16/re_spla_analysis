import { MultiSelect, Switch, Tag, VStack } from "@yamada-ui/react";
import { Table } from "@yamada-ui/table";
import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { BattleType, MatchResult } from "../../../generated";
import { ruleAtom } from "../../store/rule";
import { searchConditionAtom } from "../../store/search";
import { stageAtom } from "../../store/stage";
import { weaponAtom } from "../../store/weapon";

export function SearchContainer() {
  const columns = [
    {
      header: "作品名",
      accessorKey: "name",
    },
    {
      header: "放送期間",
      accessorKey: "broadcastPeriod",
    },
    {
      header: "話数",
      accessorKey: "episode",
    },
  ];
  const data = [
    {
      name: "ドラゴンボール",
      broadcastPeriod: "1986年2月26日 - 1989年4月19日",
      episode: "全153話",
    },
    {
      name: "ドラゴンボールZ",
      broadcastPeriod: "1989年4月26日 - 1996年1月31日",
      episode: "全291話 + スペシャル2話",
    },
    {
      name: "ドラゴンボールGT",
      broadcastPeriod: "1996年2月7日 - 1997年11月19日",
      episode: "全64話 + 番外編1話",
    },
    {
      name: "ドラゴンボール改",
      broadcastPeriod: "2009年4月5日 - 2015年6月28日",
      episode: "全159話",
    },
    {
      name: "ドラゴンボール超",
      broadcastPeriod: "2015年7月5日 - 2018年3月25日",
      episode: "全131話",
    },
  ];
  return (
    <div>
      <section style={{ display: "flex", gap: "20px" }}>
        <WeaponSelector />
        <StageSelector />
        <RuleSelector />
        <BattleTypeSelector />
        <MatchResultSelector />
        <Switch size="lg">
          <span style={{ textWrap: "nowrap" }}>AND検索</span>
        </Switch>
      </section>
      <section>
        <VStack>
          <Table variant="striped" columns={columns} data={data}></Table>
        </VStack>
      </section>
    </div>
  );
}

function MatchResultSelector() {
  const items = [
    { label: "勝ち", value: MatchResult.Victory },
    { label: "負け", value: MatchResult.Defeat },
    { label: "引き分け", value: MatchResult.Draw },
  ];
  const [condition, setCondition] = useAtom(searchConditionAtom);
  const onChange = useCallback(
    (matchResults: string[]) => {
      setCondition({ ...condition, matchResults });
    },
    [condition, setCondition]
  );
  return (
    <>
      <MultiSelect
        style={{ width: "160px" }}
        placeholder="勝敗"
        items={items}
        component={({ label, onRemove }) => (
          <Tag onClose={onRemove}>{label}</Tag>
        )}
        onChange={onChange}
      />
    </>
  );
}

function BattleTypeSelector() {
  const items = [
    { label: "Xマッチ", value: BattleType.X },
    { label: "オープン", value: BattleType.Open },
    { label: "チャレンジ", value: BattleType.Challenge },
  ];
  const [condition, setCondition] = useAtom(searchConditionAtom);
  const onChange = useCallback(
    (battleTypes: string[]) => {
      setCondition({ ...condition, battleTypes });
    },
    [condition, setCondition]
  );
  return (
    <>
      <MultiSelect
        style={{ width: "160px" }}
        placeholder="バトル種類"
        items={items}
        component={({ label, onRemove }) => (
          <Tag onClose={onRemove}>{label}</Tag>
        )}
        onChange={onChange}
      />
    </>
  );
}

function WeaponSelector() {
  const weapons = useAtomValue(weaponAtom);
  const [condition, setCondition] = useAtom(searchConditionAtom);
  const onChange = useCallback(
    (weaponIds: string[]) => {
      setCondition({ ...condition, weaponIds });
    },
    [condition, setCondition]
  );
  return (
    <>
      <MultiSelect
        style={{ width: "160px" }}
        placeholder="ブキ"
        items={weapons.map((e) => {
          return { label: e.main, value: e.id };
        })}
        component={({ label, onRemove }) => (
          <Tag onClose={onRemove}>{label}</Tag>
        )}
        onChange={onChange}
      />
    </>
  );
}

function StageSelector() {
  const stages = useAtomValue(stageAtom);
  const [condition, setCondition] = useAtom(searchConditionAtom);
  const onChange = useCallback(
    (stageIds: string[]) => {
      setCondition({ ...condition, stageIds });
    },
    [condition, setCondition]
  );
  return (
    <>
      <MultiSelect
        style={{ width: "160px" }}
        placeholder="ステージ"
        items={stages.map((e) => {
          return { label: e.name, value: e.id };
        })}
        component={({ label, onRemove }) => (
          <Tag onClose={onRemove}>{label}</Tag>
        )}
        onChange={onChange}
      />
    </>
  );
}

function RuleSelector() {
  const rules = useAtomValue(ruleAtom);
  const [condition, setCondition] = useAtom(searchConditionAtom);
  const onChange = useCallback(
    (ruleIds: string[]) => {
      setCondition({ ...condition, ruleIds });
    },
    [condition, setCondition]
  );
  return (
    <>
      <MultiSelect
        style={{ width: "160px" }}
        placeholder="ルール"
        items={rules.map((e) => {
          return { label: e.name, value: e.id };
        })}
        component={({ label, onRemove }) => (
          <Tag onClose={onRemove}>{label}</Tag>
        )}
        onChange={onChange}
      />
    </>
  );
}
