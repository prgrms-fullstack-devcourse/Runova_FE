import React from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Download, Share as ShareIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from '@emotion/native';
import ViewShot from 'react-native-view-shot';

import Header from '@/components/Header';
import type { RunTabStackParamList } from '@/types/navigation.types';
import { usePhotoDecoration } from '@/hooks/usePhotoDecoration';
import StatsRenderer from './_components/StatsRenderer';
import RouteRenderer from './_components/RouteRenderer';
import TimestampRenderer from './_components/TimestampRenderer';
import DecorationOptions from './_components/DecorationOptions';

type Props = NativeStackScreenProps<RunTabStackParamList, 'PhotoDecoration'>;

const { width: screenWidth } = Dimensions.get('window');

export default function PhotoDecoration({ route, navigation }: Props) {
  const { photoUri, recordId, path, stats: routeStats } = route.params;
  const insets = useSafeAreaInsets();

  const {
    state,
    updateState,
    updateColors,
    updateVisibility,
    updateScales,
    runningStats,
    viewShotRef,
    statsTranslateX,
    statsTranslateY,
    statsScaleAnimated,
    routeTranslateX,
    routeTranslateY,
    routeScaleAnimated,
    timestampTranslateX,
    timestampTranslateY,
    timestampScaleAnimated,
    statsPanResponder,
    routePanResponder,
    timestampPanResponder,
    handleSave,
    handleShare,
  } = usePhotoDecoration({
    path,
    routeStats,
    recordId,
    onNavigateToRunDetail: (data) => {
      navigation.navigate('RunDetail', data);
    },
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <Header
        leftIcon={ArrowLeft}
        onLeftPress={handleBackPress}
        title="사진 꾸미기"
      />

      <Content>
        <PreviewContainer>
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
            <PhotoContainer>
              {state.backgroundType === 'photo' ? (
                <OriginalPhoto source={{ uri: photoUri }} />
              ) : (
                <SolidBackground color={state.backgroundColor} />
              )}

              <StatsRenderer
                runningStats={runningStats}
                statsColor={state.colors.stats}
                visibility={state.visibility}
                statsTranslateX={statsTranslateX}
                statsTranslateY={statsTranslateY}
                statsScaleAnimated={statsScaleAnimated}
                statsPanResponder={statsPanResponder}
              />

              <RouteRenderer
                showRoute={state.visibility.route}
                routePathData={state.routePathData}
                routeColor={state.colors.route}
                routeTranslateX={routeTranslateX}
                routeTranslateY={routeTranslateY}
                routeScaleAnimated={routeScaleAnimated}
                routePanResponder={routePanResponder}
              />

              <TimestampRenderer
                showTimestamp={state.visibility.timestamp}
                runningStats={runningStats}
                timestampColor={state.colors.timestamp}
                timestampTranslateX={timestampTranslateX}
                timestampTranslateY={timestampTranslateY}
                timestampScaleAnimated={timestampScaleAnimated}
                timestampPanResponder={timestampPanResponder}
              />
            </PhotoContainer>
          </ViewShot>
        </PreviewContainer>

        <DecorationOptions
          state={state}
          updateState={updateState}
          updateColors={updateColors}
          updateVisibility={updateVisibility}
          updateScales={updateScales}
        />
      </Content>

      <BottomContainer safeAreaBottom={insets.bottom}>
        <ShareButton onPress={handleShare}>
          <ShareIcon size={24} color="#666666" />
        </ShareButton>

        <SaveButton onPress={handleSave} disabled={state.isProcessing}>
          {state.isProcessing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Download size={24} color="#ffffff" />
          )}
          <SaveText>저장하기</SaveText>
        </SaveButton>
      </BottomContainer>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});

const Content = styled.View({
  flex: 1,
});

const PreviewContainer = styled.View({
  padding: 20,
  alignItems: 'center',
});

const PhotoContainer = styled.View({
  width: screenWidth - 40,
  height: screenWidth - 40, // 정사각형 1:1 비율
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
});

const OriginalPhoto = styled(Image)({
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
});

const SolidBackground = styled.View<{ color: string }>(({ color }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: color,
}));

const BottomContainer = styled.View<{ safeAreaBottom: number }>(
  ({ safeAreaBottom }) => ({
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: safeAreaBottom + 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  }),
);

const ShareButton = styled(TouchableOpacity)({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#f8f9fa',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
});

const SaveButton = styled(TouchableOpacity)({
  flex: 1,
  height: 48,
  borderRadius: 8,
  backgroundColor: '#2d2d2d',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const SaveText = styled.Text({
  fontSize: 16,
  color: '#ffffff',
  marginLeft: 8,
  fontWeight: '600',
});
