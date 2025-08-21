import styled from '@emotion/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, Filter } from 'lucide-react-native';

import Header from '@/components/Header';

const Screen = styled.View({
  flex: 1,
  backgroundColor: '#f5f5f5',
});

const Content = styled.View({
  flex: 1,
  padding: 16,
  justifyContent: 'center',
  alignItems: 'center',
});

const Title = styled.Text({
  color: '#333',
  fontSize: 24,
  fontWeight: 'bold',
});

export default function Community() {
  const handleSearchPress = () => {
    console.log('검색 버튼 클릭');
  };

  const handleFilterPress = () => {
    console.log('필터 버튼 클릭');
  };

  return (
    <Screen>
      <Header
        title="커뮤니티"
        leftIcon={Search}
        rightIcon={Filter}
        onLeftPress={handleSearchPress}
        onRightPress={handleFilterPress}
      />
      <Content>
        <Title>Community Page</Title>
      </Content>
    </Screen>
  );
}
