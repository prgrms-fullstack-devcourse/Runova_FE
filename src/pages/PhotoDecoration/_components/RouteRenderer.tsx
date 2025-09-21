import React from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import styled from '@emotion/native';

import { getDefaultPathData } from '@/utils/photoDecorationUtils';

interface RouteRendererProps {
  showRoute: boolean;
  routePathData: string;
  routeColor: string;
  routeTranslateX: any; // Animated.Value
  routeTranslateY: any; // Animated.Value
  routeScaleAnimated: any; // Animated.Value
  routePanResponder: any;
}

export default function RouteRenderer({
  showRoute,
  routePathData,
  routeColor,
  routeTranslateX,
  routeTranslateY,
  routeScaleAnimated,
  routePanResponder,
}: RouteRendererProps) {
  if (!showRoute) {
    return null;
  }

  const finalPathData = routePathData || getDefaultPathData();

  if (!routePathData) {
    console.log('📊 [RouteRenderer] routePathData가 없음, 테스트 경로 사용');
  }

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateX: routeTranslateX },
            { translateY: routeTranslateY },
            { scale: routeScaleAnimated },
          ],
        },
      ]}
      {...routePanResponder.panHandlers}
    >
      <RouteImageContainer>
        <Svg width={120} height={100} viewBox="0 0 100 80">
          <Path
            d={finalPathData}
            stroke={routeColor}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </RouteImageContainer>
    </Animated.View>
  );
}

const RouteImageContainer = styled.View({
  position: 'absolute',
  bottom: 20,
  right: 20,
  width: 120,
  height: 100,
  justifyContent: 'center',
  alignItems: 'center',
});
