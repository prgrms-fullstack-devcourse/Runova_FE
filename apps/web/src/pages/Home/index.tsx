import styled from '@emotion/styled';
import { useConstellation } from '@/hooks/useConstellation';

const DL_URL =
  'https://github.com/prgrms-fullstack-devcourse/Runova_FE/releases/download/v1.0.0/runova.apk';

export default function Home() {
  const canvasRef = useConstellation();

  return (
    <Wrap>
      <StarsCanvas ref={canvasRef} />
      <Glow />
      <Card>
        <Title>Runova</Title>
        <Desc>
          도시 위에 <b>GPS 아트</b>를 새기는 러닝 앱. 달려서 나만의 별자리
          지도를 완성해 보세요.
        </Desc>
      </Card>
      <Card>
        <Title as="h2">다운로드 링크</Title>
        <List>
          <li>
            <A href={DL_URL} rel="noopener">
              <span>Android APK (v1.0.0)</span>
              <span>⬇</span>
            </A>
          </li>
        </List>
      </Card>
      <Card>
        <Features>
          <Feature>
            <FeatImg src="/images/navigate.jpg" alt="내비게이션" />
            <H>경로 안내 제공</H>
            <P>
              실시간 경로 트래킹과 경로 안내를 통해, 나만의 GPS 아트를 따라
              달려보세요.
            </P>
          </Feature>
          <Feature>
            <FeatImg src="/images/track.jpg" alt="정밀 기록" />
            <H>경로 설계</H>
            <P>원하는 모양대로 경로를 그리고 다른 사람들과 공유해 보세요.</P>
          </Feature>
          <Feature>
            <FeatImg src="/images/community.jpg" alt="공유" />
            <H>커뮤니티</H>
            <P>
              완주 인증 사진, 경로 공유, 팀메이트 구하기까지, 커뮤니티에서 함께
              나눠요.
            </P>
          </Feature>
        </Features>
      </Card>
    </Wrap>
  );
}

const Wrap = styled.main`
  position: relative;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  gap: 18px;
  padding: 24px 16px 40px;
  background: #000;
  color: #fff;
  overflow: hidden;
`;

const StarsCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const Glow = styled.div`
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(
      60% 50% at 50% 40%,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0) 60%
    ),
    radial-gradient(
      40% 35% at 70% 70%,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0) 65%
    );
  pointer-events: none;
`;

const Card = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: min(760px, 92vw);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  padding: 28px;
  background: rgba(16, 16, 16, 0.72);
  backdrop-filter: blur(6px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
`;

const Title = styled.h1`
  font-size: 28px;
  line-height: 1.2;
  margin: 0 0 8px;
`;

const Desc = styled.p`
  margin: 0 10px 18px 0;
  color: #d8d8d8;
  font-size: 14px;
  line-height: 1.6;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Feature = styled.div`
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
`;

const H = styled.h3`
  margin: 0 0 6px;
  font-size: 16px;
  line-height: 1.3;
`;

const P = styled.p`
  margin: 0;
  color: #cfcfcf;
  font-size: 13px;
  line-height: 1.5;
`;

const List = styled.ul`
  display: grid;
  gap: 12px;
  margin: 12px 0 4px;
  padding: 0;
  list-style: none;
`;

const A = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  text-decoration: none;
  color: #fff;
  transition:
    transform 120ms ease,
    background 120ms ease,
    border-color 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.28);
  }
`;

const FeatImg = styled.img`
  width: 100%;
  height: 380px;
  object-fit: cover;
  border-radius: 10px;
  margin: 0 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;
