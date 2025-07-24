import { supabase } from './supabaseClient';

// Get current user from ai_users table
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('ai_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user from ai_users:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Check if user exists in ai_users
export async function checkUserExists(userId) {
  const { data, error } = await supabase
    .from('ai_users')
    .select('id')
    .eq('id', userId)
    .single();
  return !!data && !error;
}

// Insert user into ai_users
export async function insertUserManually(user) {
  const { id, email, user_metadata } = user;
  const name = user_metadata?.name || '';
  const provider = user.app_metadata?.provider || 'email';

  const { error } = await supabase.from('ai_users').insert([
    {
      id,
      email,
      name,
      provider,
    },
  ]);
  return !error;
} 