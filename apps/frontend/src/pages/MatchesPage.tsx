import { useNavigate } from '@tanstack/react-router';
import { Table, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainLayout } from '../components/layouts/MainLayout';
import { Button } from '../components/ui';

export function MatchesPage() {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate({ to: '/matches/new' });
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>試合履歴</h1>
          <Button
            variant="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            新規登録
          </Button>
        </div>

        <Table
          dataSource={[]}
          columns={[
            { title: '日時', dataIndex: 'gameDateTime', key: 'gameDateTime' },
            { title: 'ルール', dataIndex: 'rule', key: 'rule' },
            { title: 'ステージ', dataIndex: 'stage', key: 'stage' },
            { title: '武器', dataIndex: 'weapon', key: 'weapon' },
            { title: 'バトルタイプ', dataIndex: 'battleType', key: 'battleType' },
            { title: '勝敗', dataIndex: 'result', key: 'result' },
            { title: 'ポイント', dataIndex: 'point', key: 'point' },
          ]}
          locale={{
            emptyText: (
              <Empty
                description="試合データがありません"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          pagination={false}
        />
      </div>
    </MainLayout>
  );
}
