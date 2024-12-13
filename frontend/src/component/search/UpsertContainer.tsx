import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  VStack,
  Wrap,
} from "@yamada-ui/react";
import { Table } from "@yamada-ui/table";

interface UpsertContainerProps {
  open: boolean;
  close: () => void;
  submit: () => void;
}

export function UpsertContainer(props: UpsertContainerProps) {
  const { open, close, submit } = props;
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
      name: "編集すっぞ",
      broadcastPeriod: "1986年2月26日 - 1989年4月19日",
      episode: "全153話",
    },
    {
      name: "編集すっぞ",
      broadcastPeriod: "1989年4月26日 - 1996年1月31日",
      episode: "全291話 + スペシャル2話",
    },
    {
      name: "編集すっぞ",
      broadcastPeriod: "1996年2月7日 - 1997年11月19日",
      episode: "全64話 + 番外編1話",
    },
    {
      name: "編集すっぞ",
      broadcastPeriod: "2009年4月5日 - 2015年6月28日",
      episode: "全159話",
    },
    {
      name: "編集すっぞ",
      broadcastPeriod: "2015年7月5日 - 2018年3月25日",
      episode: "全131話",
    },
  ];
  return (
    <Modal open={open} onClose={close}>
      <ModalHeader>追加モーダル</ModalHeader>
      <ModalBody>
        <VStack>
          <Table variant="striped" columns={columns} data={data}></Table>
        </VStack>
        <ModalCloseButton onClick={close} />
        <Wrap gap="md">
          <Button onClick={close} variant="ghost">
            キャンセル
          </Button>
          <Button onClick={submit} colorScheme="primary">
            登録
          </Button>
        </Wrap>
      </ModalBody>
    </Modal>
  );
}
