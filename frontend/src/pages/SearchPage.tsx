import {
  NativeTable,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@yamada-ui/react";
import { useAtomValue } from "jotai";
import { Rule, Stage, Weapon } from "../../generated";
import { ruleAtom } from "../store/rule";
import { stageAtom } from "../store/stage";
import { weaponAtom } from "../store/weapon";

export default function SearchPage() {
  return (
    <div style={{ display: "flex" }}>
      <section style={{ overflow: "scroll", height: "70vh" }}>
        <WeaponTable />
      </section>
      <section style={{ overflow: "scroll", height: "70vh" }}>
        <StageTable />
      </section>
      <section style={{ overflow: "scroll", height: "70vh" }}>
        <RuleTable />
      </section>
    </div>
  );
}

function WeaponTable() {
  const weapons = useAtomValue(weaponAtom);
  return (
    <>
      <TableContainer key="weapon">
        <NativeTable>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>name</Th>
            </Tr>
          </Thead>
          <Tbody>
            <DefaultTable items={weapons} key="weapon-table" />
          </Tbody>
        </NativeTable>
      </TableContainer>
    </>
  );
}

function StageTable() {
  const stages = useAtomValue(stageAtom);
  return (
    <>
      <TableContainer key="stages">
        <NativeTable>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>name</Th>
            </Tr>
          </Thead>
          <Tbody>
            <DefaultTable items={stages} key="stage-table" />
          </Tbody>
        </NativeTable>
      </TableContainer>
    </>
  );
}

function RuleTable() {
  const rules = useAtomValue(ruleAtom);
  console.log("rules ---", rules);
  return (
    <>
      <TableContainer key={"rule"}>
        <NativeTable>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>name</Th>
            </Tr>
          </Thead>
          <Tbody>
            <DefaultTable items={rules} key="rule-table" />
          </Tbody>
        </NativeTable>
      </TableContainer>
    </>
  );
}

function DefaultTable(props: { items: Stage[] | Rule[] | Weapon[] }) {
  const { items } = props;
  return (
    <>
      {items.map((e) => {
        return (
          <Tr key={e.id}>
            <Td>{e.id}</Td>
            <Td>{e.name ? e.name : e.main}</Td>
          </Tr>
        );
      })}
    </>
  );
}
