import styled from '@emotion/native';
import { FileText } from 'lucide-react-native';
import Header from '@/components/Header';

export default function Records() {
  return (
    <Screen>
      <Header title="기록" rightIcon={FileText} onRightPress={() => {}} />
      <Content>
        <Text>기록 페이지</Text>
      </Content>
    </Screen>
  );
}

const Screen = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});

const Content = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const Text = styled.Text({
  fontSize: 16,
  color: '#666666',
});
