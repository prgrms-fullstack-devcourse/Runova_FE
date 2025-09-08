import { View } from 'react-native';
import styled from '@emotion/native';
import { Edit3, Eraser, LocateFixed } from 'lucide-react-native';
import { theme } from '@/styles/theme';
import FloatingButton from '@/components/FloatingButton';
import type { DrawUIProps } from '@/types/draw.types';
import useDrawStore from '@/store/draw';

export default function DrawUI({ onPanToCurrentUserLocation }: DrawUIProps) {
  const { drawMode, toggleDrawMode, toggleEraseMode } = useDrawStore();

  return (
    <>
      <StyledDrawButtonContainer>
        <FloatingButton
          icon={Edit3}
          onPress={toggleDrawMode}
          style={[
            styles.defaultButton,
            drawMode === 'draw' ? styles.activeButton : {},
          ]}
          iconColor={drawMode === 'draw' ? '#ffffff' : '#000000'}
        />
      </StyledDrawButtonContainer>
      <StyledEraseButtonContainer>
        <FloatingButton
          icon={Eraser}
          onPress={toggleEraseMode}
          style={[
            styles.defaultButton,
            drawMode === 'erase' ? styles.activeButton : {},
          ]}
          iconColor={drawMode === 'erase' ? '#ffffff' : '#000000'}
        />
      </StyledEraseButtonContainer>
      <StyledLocateButtonContainer>
        <FloatingButton
          icon={LocateFixed}
          onPress={onPanToCurrentUserLocation}
          style={styles.defaultButton}
          iconColor="#000000"
        />
      </StyledLocateButtonContainer>
    </>
  );
}

const StyledDrawButtonContainer = styled(View)`
  position: absolute;
  right: 0;
  bottom: 10px;
`;

const StyledEraseButtonContainer = styled(View)`
  position: absolute;
  right: 0;
  bottom: -60px;
`;

const StyledLocateButtonContainer = styled(View)`
  position: absolute;
  right: 0;
  top: 200px;
`;

const styles = {
  defaultButton: {
    backgroundColor: '#ffffff',
  },
  activeButton: {
    backgroundColor: theme.colors.secondary[500],
    elevation: 12,
    shadowOpacity: 0.5,
  },
};
