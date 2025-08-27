import ListRow from './ListRow';
import type { RoutePreview } from '@/types/mypage';

export default function RouteItem({
  data,
  onClick,
}: {
  data: RoutePreview;
  onClick?: () => void;
}) {
  return (
    <ListRow
      thumbnail={data.thumbnail}
      title={data.title}
      meta={data.meta}
      sub={data.savedAt}
      onClick={onClick}
    />
  );
}
