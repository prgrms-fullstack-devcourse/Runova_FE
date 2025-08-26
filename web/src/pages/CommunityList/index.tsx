import styled from '@emotion/styled';
import AppLayout from '@/components/layout/AppLayout';
import CategoryTabs from '@/components/layout/CategoryTabs';
import PostItem from './_components/PostItem';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '@/stores/communityStore';

const List = styled.div`
  padding: 0 16px;
`;

const Fab = styled.button`
  position: fixed;
  right: 24px;
  bottom: 48px;
  width: 56px;
  height: 56px;
  border-radius: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.fab};
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover {
    opacity: 0.9;
  }
`;

export default function CommunityList() {
  const nav = useNavigate();
  const { posts, filter, setFilter } = useCommunityStore();
  const filtered =
    filter === 'all' ? posts : posts.filter((p) => p.category === filter);

  return (
    <AppLayout
      title="커뮤니티"
      tabs={<CategoryTabs value={filter} onChange={setFilter} />}
      topOffset={96}
    >
      <List>
        {filtered.map((p) => (
          <PostItem
            key={p.id}
            post={p}
            onClick={(post) => nav(`/community/${post.id}`)}
          />
        ))}
      </List>

      <Fab onClick={() => nav('/community/edit')}>
        <i className="ri-add-fill" style={{ fontSize: 22 }} />
      </Fab>
    </AppLayout>
  );
}
