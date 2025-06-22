import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ValidationRules {
  email?: boolean;
  password?: boolean;
  username?: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return undefined;
  };

  const validateUsername = (username: string): string | undefined => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return undefined;
  };

  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return true;
    
    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        return true;
      }
      
      return !data; // Username is taken if data exists
    } catch {
      return true; // Assume available on error
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  const validateField = useCallback(async (field: string, value: string, rules: ValidationRules) => {
    let error: string | undefined;
    
    switch (field) {
      case 'email':
        if (rules.email) error = validateEmail(value);
        break;
      case 'password':
        if (rules.password) error = validatePassword(value);
        break;
      case 'username':
        if (rules.username) {
          error = validateUsername(value);
          if (!error) {
            const isAvailable = await checkUsernameAvailability(value);
            if (!isAvailable) error = 'Username is already taken';
          }
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [checkUsernameAvailability]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    isCheckingUsername,
    validateField,
    clearErrors
  };
};