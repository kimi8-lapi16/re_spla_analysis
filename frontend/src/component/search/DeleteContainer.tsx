import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@yamada-ui/react";

interface DeleteContainerProps {
  id: string;
  open: boolean;
  close: () => void;
  submit: () => void;
}

export function DeleteContainer(props: DeleteContainerProps) {
  const { id, open, close, submit } = props;
  return (
    <Modal open={open} onClose={close}>
      <ModalHeader>確認</ModalHeader>
      <ModalBody>
        次のデータを削除します。よろしかったら削除ボタンを押下してください。
        {id}
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={close}>
          キャンセル
        </Button>
        <Button colorScheme="primary" onClick={submit}>
          削除
        </Button>
      </ModalFooter>
    </Modal>
  );
}
