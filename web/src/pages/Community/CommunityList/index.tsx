import PostCard from '../_components/Postcard';

export default function CommunityList() {
  return (
    <div>
      <PostCard
        userName="홍길동"
        postDate="2025-09-01"
        profileImageUrl="https://picsum.photos/48?random=1"
        postImageUrl="https://picsum.photos/600/300?random=1"
        contents="오늘은 날씨가 좋아서 산책을 다녀왔습니다."
        likes={12}
        isLiked={true}
        comments={3}
      />
      <PostCard
        userName="홍길동"
        postDate="2025-09-01"
        profileImageUrl="https://picsum.photos/48?random=2"
        postImageUrl="https://picsum.photos/600/300?random=2"
        contents="오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다.오늘은 날씨가 좋아서 산책을 다녀왔습니다."
        likes={12}
        isLiked={false}
        comments={3}
      />
    </div>
  );
}
