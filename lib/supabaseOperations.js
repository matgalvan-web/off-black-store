import { supabase } from './supabaseClient';

// ============ AUTH FUNCTIONS ============
export const registerUser = async (name, email, password) => {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error ?? 'Error en registro' };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error?.message || String(error) };
  }
};

export const loginUser = async (email, password) => {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) throw error;

    const user = data?.user;
    if (!user) {
      throw new Error('No se pudo iniciar sesión');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    return {
      success: true,
      user: userData || {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
      },
    };
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

    const user = data.session.user;
    if (!user) return { success: true, user: null };

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userError) throw userError;

    return {
      success: true,
      user: userData || {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
      },
    };
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
