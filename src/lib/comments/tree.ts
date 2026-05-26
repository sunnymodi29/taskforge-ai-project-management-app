import type { Comment } from "@/types";

export type CommentWithReplies = Comment & { replies: CommentWithReplies[] };

export function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const nodes = new Map<string, CommentWithReplies>();
  const roots: CommentWithReplies[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id)!;
    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)!.replies.push(node);
    } else if (!comment.parentId) {
      roots.push(node);
    }
  }

  return roots;
}

export function countComments(comments: Comment[]): number {
  return comments.length;
}
