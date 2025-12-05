import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, Typography } from "antd";
import { useNotification } from "../../../contexts/NotificationContext";
import { useBulkDeleteMatches } from "../../../hooks/useMatch";

const { Text } = Typography;

type MatchDeleteConfirmModalProps = {
  open: boolean;
  matchIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
};

export function MatchDeleteConfirmModal({
  open,
  matchIds,
  onSuccess,
  onCancel,
}: MatchDeleteConfirmModalProps) {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const { mutate: deleteMatches, isPending: isDeleting } = useBulkDeleteMatches();

  const handleConfirm = () => {
    deleteMatches(
      { ids: matchIds },
      {
        onSuccess: () => {
          notification.success({
            title: "SUCCESS",
            description: "試合データを削除しました",
            placement: "topRight",
          });
          queryClient.invalidateQueries({ queryKey: ["matches"] });
          onSuccess();
        },
        onError: (error) => {
          notification.error({
            title: "ERROR",
            description: `削除に失敗しました: ${error.message}`,
            placement: "topRight",
          });
        },
      }
    );
  };

  return (
    <Modal
      title={
        <Text>
          <ExclamationCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
          削除の確認
        </Text>
      }
      open={open}
      onOk={handleConfirm}
      onCancel={onCancel}
      okText="削除する"
      cancelText="キャンセル"
      okButtonProps={{ danger: true, loading: isDeleting }}
      cancelButtonProps={{ disabled: isDeleting }}
    >
      <Text>選択した {matchIds.length} 件の試合データを削除しますか？</Text>
      <br />
      <Text type="danger">この操作は取り消せません。</Text>
    </Modal>
  );
}
