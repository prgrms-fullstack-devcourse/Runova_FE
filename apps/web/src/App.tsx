import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CommunityList from '@/pages/Community/CommunityList';
import CommunityFeed from './pages/Community/CommunityFeed';
import CommunityDetail from '@/pages/Community/CommunityDetail';
import CommunityEdit from '@/pages/Community/CommunityEdit';
import MyPage from './pages/MyPage';
import MyStats from './pages/MyStats';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/community" replace />} />
        <Route path="/community" element={<CommunityList />} />
        <Route path="/community/feed/:type" element={<CommunityFeed />} />
        <Route path="/community/:id" element={<CommunityDetail />} />
        <Route path="/community/edit" element={<CommunityEdit />} />
        <Route path="/community/edit/:id" element={<CommunityEdit />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/stats" element={<MyStats />} />
      </Routes>
    </BrowserRouter>
  );
}
