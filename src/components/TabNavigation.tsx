import styled from '@emotion/native';

interface TabItem<T = string> {
  id: T;
  title: string;
}

interface TabNavigationProps<T = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabPress: (tabId: T) => void;
}

export default function TabNavigation<T = string>({
  tabs,
  activeTab,
  onTabPress,
}: TabNavigationProps<T>) {
  return (
    <TabContainer>
      {tabs.map((tab) => (
        <TabButton
          key={String(tab.id)}
          isActive={activeTab === tab.id}
          onPress={() => onTabPress(tab.id)}
        >
          <TabText isActive={activeTab === tab.id}>{tab.title}</TabText>
        </TabButton>
      ))}
    </TabContainer>
  );
}

const TabContainer = styled.View({
  flexDirection: 'row',
  backgroundColor: '#ffffff',
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: 'transparent',
});

const TabButton = styled.TouchableOpacity<{
  isActive: boolean;
}>(({ isActive }) => ({
  flex: 1,
  alignItems: 'center',
  paddingVertical: 8,
  borderBottomWidth: isActive ? 2 : 0,
  borderBottomColor: '#2d2d2d',
}));

const TabText = styled.Text<{
  isActive: boolean;
}>(({ isActive }) => ({
  fontSize: 14,
  fontWeight: isActive ? '600' : '400',
  color: isActive ? '#2d2d2d' : '#666666',
}));
