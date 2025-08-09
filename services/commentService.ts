import { Comment as CommentType } from '../types';
import { supabase } from '../lib/supabase';

export class CommentService {
  static async fetchComments(articleId: string): Promise<{ data: CommentType[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user:users!user_id (
            id,
            nickname
          )
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return { data: null, error: 'コメントの取得に失敗しました' };
      }

      // データ構造を変換してComment型に合わせる
      const formattedData = data?.map(item => ({
        id: item.id,
        user_id: item.user?.[0]?.id || '',
        article_id: articleId,
        content: item.content,
        created_at: item.created_at,
        updated_at: item.created_at, // updated_atがない場合はcreated_atを使用
        user: Array.isArray(item.user) ? item.user[0] : item.user,
        parent_id: undefined
      })) as CommentType[] || [];
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return { data: null, error: 'コメントの取得に失敗しました' };
    }
  }

  static async createComment(articleId: string, userId: string, content: string): Promise<{ success: boolean; error?: string }> {
    if (!content.trim()) {
      return { success: false, error: 'コメントを入力してください。' };
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            article_id: articleId,
            user_id: userId,
            content: content.trim(),
          }
        ]);

      if (error) {
        console.error('Error creating comment:', error);
        return { success: false, error: 'コメントの投稿に失敗しました。' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating comment:', error);
      return { success: false, error: 'コメントの投稿に失敗しました。' };
    }
  }

  static async deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        return { success: false, error: 'コメントの削除に失敗しました。' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: 'コメントの削除に失敗しました。' };
    }
  }
}