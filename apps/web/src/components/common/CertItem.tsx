import ListRow from './ListRow';
import type { CertPreview } from '@/types/mypage';

export default function CertItem({
  data,
  onClick,
}: {
  data: CertPreview;
  onClick?: () => void;
}) {
  return (
    <ListRow
      thumbnail={data.thumbnail}
      title={data.title}
      meta={data.place}
      sub={data.datetime}
      onClick={onClick}
    />
  );
}
