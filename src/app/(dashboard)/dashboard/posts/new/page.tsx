import { CreatorGuard } from "@/components/auth/creator-guard";
import { PostComposer } from "@/components/posts/PostComposer";

export default function NewPostPage() {
  return (
    <CreatorGuard>
      <PostComposer />
    </CreatorGuard>
  );
}
