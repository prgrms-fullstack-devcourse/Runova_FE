# Important

All developers on this project are Korean. Therefore, **please ensure all code reviews and comments are written in Korean** so that they are easily understood by the team.

---

# 📘 Style Guide (React Native)

본 문서는 React Native 프로젝트 내 모든 개발자가 일관된 코드 스타일과 품질을 유지하기 위한 규칙을 정의합니다.
모든 코드 리뷰 및 코멘트는 **한국어**로 작성해야 합니다.

---

## 🎯 TypeScript

### 타입 사용 원칙

* `any`는 금지합니다. 불가피할 경우 `unknown`을 우선 사용합니다.
* API 응답 타입은 반드시 **명시적으로 정의**합니다.
* Props, State, Navigation Param 등은 **interface 또는 type alias**로 관리합니다.

```tsx
// ❌ 잘못된 예시
function UserCard(props: any) {
  return <Text>{props.name}</Text>;
}

// ✅ 올바른 예시
interface UserCardProps {
  name: string;
  age: number;
}

function UserCard({ name, age }: UserCardProps) {
  return <Text>{name} ({age})</Text>;
}
```

---

## 📂 폴더 및 파일 구조

* 기능 단위(feature-based)로 구성합니다.
* 공통 컴포넌트, hooks, utils 등은 별도 디렉토리로 분리합니다.

```
src/
  components/
    Button/
      Button.tsx
      Button.styles.ts
      index.ts
  screens/
    Home/
      HomeScreen.tsx
      HomeHeader.tsx
  hooks/
    useAuth.ts
  utils/
    date.ts
  navigation/
    RootNavigator.tsx
```

---

## 🖼️ React Native 컴포넌트

### 컴포넌트 작성

* **함수형 컴포넌트**만 사용합니다.
* 파일명과 컴포넌트명은 **PascalCase**로 통일합니다.
* JSX는 가독성을 위해 적절히 줄바꿈합니다.

```tsx
// ✅ 예시
export function ProfileCard({ user }: { user: User }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <Text style={styles.name}>{user.name}</Text>
    </View>
  );
}
```

### Props 관리

* props는 **명시적 인터페이스**로 정의합니다.
* 불필요한 drilling은 Context API 또는 Zustand/Recoil 같은 상태 관리 라이브러리로 대체합니다.

---

## 🎨 스타일링

* 스타일은 반드시 `StyleSheet.create` 또는 **styled-components/emotion**을 사용합니다.
* 인라인 스타일은 **빠른 시제품용** 외에는 지양합니다.
* 재사용 가능한 색상, 폰트, spacing은 **theme 또는 constants 파일**로 관리합니다.

```tsx
// ✅ 예시
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
});
```

---

## ⚡ 성능 최적화

### 렌더링 최적화

* `FlatList`, `SectionList` 사용 시:

  * 반드시 `keyExtractor`를 정의합니다.
  * `renderItem`은 **별도 컴포넌트로 분리**하고 `React.memo` 적용을 권장합니다.
* `useCallback`, `useMemo`를 적절히 사용해 불필요한 re-render를 방지합니다.

```tsx
const renderItem = useCallback(
  ({ item }: { item: User }) => <UserCard user={item} />,
  []
);
```

### 네비게이션 최적화

* React Navigation 사용 시, `screenOptions`는 전역/공통 설정을 최대한 활용합니다.
* **불필요한 params 전달**을 피하고, 상태는 전역 상태 관리로 대체합니다.

### 이미지 최적화

* `Image`는 반드시 `resizeMode`와 크기를 지정합니다.
* 가능하면 `react-native-fast-image` 같은 캐싱 라이브러리를 활용합니다.

---

## 📦 코드 품질

* 상수는 하드코딩하지 말고 `constants.ts` 또는 `theme.ts`에 관리합니다.
* 매직 넘버(예: 200, 0.5 등)는 **이름 있는 상수**로 치환합니다.
* 에러 처리는 `try/catch`로 감싸고, 사용자 친화적인 메시지를 제공합니다.

