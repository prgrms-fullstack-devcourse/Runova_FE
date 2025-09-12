import styled from '@emotion/styled';
import { useEffect, useRef, useState, useMemo } from 'react';
import { uploadAvatarAndRefresh } from '@/api/mypage';

export type ProfileSectionProps = {
  profile?: {
    nickname: string;
    avatarUrl?: string | null;
    createdAt?: string;
  };
  onAvatarUpdated?: (newUrl: string) => void;
};

export default function ProfileSection({
  profile,
  onAvatarUpdated,
}: ProfileSectionProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const name = profile?.nickname ?? '불러오는 중...';
  const serverAvatar = profile?.avatarUrl ?? '';

  const [avatarSrc, setAvatarSrc] = useState(serverAvatar);

  useEffect(() => {
    setAvatarSrc(serverAvatar || '');
  }, [serverAvatar]);

  const since = useMemo(() => {
    if (!profile?.createdAt) {
      return undefined;
    }
    const d = new Date(profile.createdAt);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}년 ${m}월부터 시작`;
  }, [profile?.createdAt]);

  const onClickEdit = () => fileRef.current?.click();

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (!f || uploading) return;

    const prev = avatarSrc;
    const tempUrl = URL.createObjectURL(f);
    setAvatarSrc(tempUrl);

    try {
      setUploading(true);

      const nextProfile = await uploadAvatarAndRefresh(f);

      const finalUrl = nextProfile.imageUrl
        ? `${nextProfile.imageUrl}${nextProfile.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
        : '';

      if (finalUrl) {
        setAvatarSrc(finalUrl);
        onAvatarUpdated?.(finalUrl);
      } else {
        setAvatarSrc(prev);
        alert('아바타가 업데이트되었지만 URL을 가져오지 못했습니다.');
      }
    } catch (err) {
      console.error('[avatar] upload error:', err);
      setAvatarSrc(prev);
      alert('업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(tempUrl);
    }
  };

  return (
    <Section>
      <Row>
        <AvatarWrap>
          <Avatar alt="프로필 이미지" src={avatarSrc || undefined} />
          <EditBtn
            aria-label="프로필 수정"
            onClick={onClickEdit}
            disabled={uploading}
            title={uploading ? '업로드 중…' : '아바타 변경'}
          >
            {uploading ? (
              <i className="ri-loader-4-line ri-spin" />
            ) : (
              <i className="ri-edit-line" />
            )}
          </EditBtn>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPickFile}
          />
        </AvatarWrap>
        <InfoWrap>
          <Name>{name}</Name>
          {since && (
            <Since>
              <i className="ri-calendar-line" />
              <span>{since}</span>
            </Since>
          )}
        </InfoWrap>
      </Row>
    </Section>
  );
}

const Section = styled.section`
  padding: 24px 16px;
  background: ${({ theme }) => theme.colors.surface};
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const AvatarWrap = styled.div`
  position: relative;
`;
const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

const InfoWrap = styled.div`
  flex: 1;
`;

const EditBtn = styled.button`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 12px;
  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;
const Name = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;
const Since = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
  i {
    margin-right: 4px;
  }
`;
