import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserGroupHistory } from '../components/groups';
import { Header } from '../components/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, User, Users } from 'lucide-react';

export const UserGroupHistoryPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userName, setUserName] = useState('Người dùng');

  const handleBlockUser = (groupId: number, groupName: string) => {
    console.log(`User blocked from group ${groupId} (${groupName})`);
    // You can add additional logic here, such as:
    // - Refresh the user's profile
    // - Show a notification
    // - Update the UI to reflect the block
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy người dùng</h1>
            <p className="text-gray-600 mb-6">Vui lòng kiểm tra lại đường dẫn.</p>
            <Button variant="primary" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Lịch sử nhóm của {userName}
              </h1>
              <p className="text-gray-600">
                Xem và quản lý các nhóm mà người dùng đã tham gia
              </p>
            </div>
          </div>
        </div>

        {/* User Group History Component */}
        <UserGroupHistory
          userId={parseInt(userId, 10)}
          userName={userName}
          onBlockUser={handleBlockUser}
        />

        {/* Additional Information */}
        <Card className="p-6 mt-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Thông tin về chức năng chặn
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  • Khi chặn một người dùng khỏi nhóm, họ sẽ không thể tham gia lại nhóm đó
                </p>
                <p>
                  • Chỉ có quản trị viên và chủ sở hữu nhóm mới có thể chặn người dùng
                </p>
                <p>
                  • Người dùng bị chặn vẫn có thể xem nội dung công khai của nhóm
                </p>
                <p>
                  • Bạn có thể bỏ chặn người dùng bất kỳ lúc nào
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};
