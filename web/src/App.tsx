import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CommunityList from '@/pages/CommunityList';
import CommunityDetail from '@/pages/CommunityDetail';
import CommunityEdit from '@/pages/CommunityEdit';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/community" replace />} />
        <Route path="/community" element={<CommunityList />} />
        <Route path="/community/:id" element={<CommunityDetail />} />
        <Route path="/community/edit" element={<CommunityEdit />} />
        <Route path="/community/edit/:id" element={<CommunityEdit />} />
      </Routes>
    </BrowserRouter>
  );
}
