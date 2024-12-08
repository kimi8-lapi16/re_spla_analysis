import {
  NativeTable,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@yamada-ui/react";

export default function SearchPage() {
  return (
    <>
      <TableContainer>
        <NativeTable>
          <Thead>
            <Tr>
              <Th>作品名</Th>
              <Th>放送期間</Th>
              <Th isNumeric>話数</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td>ドラゴンボール</Td>
              <Td>1986年2月26日 - 1989年4月19日</Td>
              <Td isNumeric>全153話</Td>
            </Tr>
            <Tr>
              <Td>ドラゴンボールZ</Td>
              <Td>1989年4月26日 - 1996年1月31日</Td>
              <Td isNumeric>全291話 + スペシャル2話</Td>
            </Tr>
            <Tr>
              <Td>ドラゴンボールGT</Td>
              <Td>1996年2月7日 - 1997年11月19日</Td>
              <Td isNumeric>全64話 + 番外編1話</Td>
            </Tr>
            <Tr>
              <Td>ドラゴンボール改</Td>
              <Td>2009年4月5日 - 2015年6月28日</Td>
              <Td isNumeric>全159話</Td>
            </Tr>
            <Tr>
              <Td>ドラゴンボール超</Td>
              <Td>2015年7月5日 - 2018年3月25日</Td>
              <Td isNumeric>全131話</Td>
            </Tr>
          </Tbody>

          <Tfoot>
            <Tr>
              <Th>作品名</Th>
              <Th>放送期間</Th>
              <Th isNumeric>話数</Th>
            </Tr>
          </Tfoot>
        </NativeTable>
      </TableContainer>
    </>
  );
}
