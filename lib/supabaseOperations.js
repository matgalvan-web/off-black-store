import { supabase } from './supabaseClient';

// ============ AUTH FUNCTIONS ============
export const registerUser = async (name, email, password) => {
  try {
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile in database
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          created_at: new Date(),
        },
      ]);

    if (dbError) throw dbError;

    return { success: true, user: authData.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (!data.session) return { success: true, user: null };

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.session.user.id)
      .single();

    if (userError) throw userError;

    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============ PRODUCTS FUNCTIONS ============
export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, products: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, product: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============ CART FUNCTIONS ============
export const addToCart = async (userId, productId, quantity, color, size) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          quantity,
          color,
          size,
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    return { success: true, cartItem: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCart = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true, cartItems: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select();

    if (error) throw error;

    return { success: true, cartItem: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============ ORDERS FUNCTIONS ============
export const createOrder = async (userId, items, total, shippingAddress) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          items,
          total,
          shipping_address: shippingAddress,
          status: 'pending',
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    // Clear cart after order
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    return { success: true, order: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, orders: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
