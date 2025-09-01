import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CommunityList from '@/pages/Community/CommunityList';
import CommunityFeed from './pages/Community/CommunityFeed';
import CommunityDetail from '@/pages/Community/CommunityDetail';
import CommunityEdit from '@/pages/Community/CommunityEdit';
import MyPage from './pages/MyPage';
import RoutesPage from './pages/MyRoutesPage';
import PostsPage from './pages/MyPostsPage';
import CertsPage from './pages/MyCertsPage';

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
        <Route path="/mypage/routes" element={<RoutesPage />} />
        <Route path="/mypage/posts" element={<PostsPage />} />
        <Route path="/mypage/certs" element={<CertsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
