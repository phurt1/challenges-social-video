import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { signIn, signUp } = useAuth();
  const { errors, isCheckingUsername, validateField, clearErrors } = useFormValidation();
  const { toast } = useToast();

  useEffect(() => {
    clearErrors();
    setAuthError('');
  }, [isLogin, clearErrors]);

  const handleFieldChange = async (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        if (value) await validateField('email', value, { email: true });
        break;
      case 'password':
        setPassword(value);
        if (value) await validateField('password', value, { password: true });
        break;
      case 'username':
        setUsername(value);
        if (value && !isLogin) await validateField('username', value, { username: true });
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    
    try {
      // Validate all fields
      const emailValid = await validateField('email', email, { email: true });
      const passwordValid = await validateField('password', password, { password: true });
      const usernameValid = isLogin || await validateField('username', username, { username: true });
      
      if (!emailValid || !passwordValid || !usernameValid) {
        setLoading(false);
        return;
      }
      
      if (isLogin) {
        await signIn(email, password);
        toast({ title: 'Welcome back!', description: 'Successfully signed in.' });
      } else {
        await signUp(email, password, username);
        toast({ title: 'Account created!', description: 'Welcome to the platform.' });
      }
    } catch (error: any) {
      const message = error?.message || 'An unexpected error occurred';
      setAuthError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-center text-white">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                    className={cn(
                      "bg-gray-800 border-gray-700 text-white pr-10",
                      errors.username && "border-red-500"
                    )}
                    required
                    aria-describedby={errors.username ? 'username-error' : undefined}
                  />
                  {isCheckingUsername && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {username && !isCheckingUsername && !errors.username && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                  {errors.username && (
                    <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.username && (
                  <p id="username-error" className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={cn(
                  "bg-gray-800 border-gray-700 text-white",
                  errors.email && "border-red-500"
                )}
                required
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={cn(
                  "bg-gray-800 border-gray-700 text-white",
                  errors.password && "border-red-500"
                )}
                required
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500">{errors.password}</p>
              )}
              {!isLogin && password && (
                <PasswordStrengthIndicator password={password} />
              )}
            </div>
            
            {authError && (
              <Alert className="border-red-500 bg-red-500/10">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-red-400">{authError}</AlertDescription>
              </Alert>
            )}
            
            <Button
              type="submit"
              disabled={loading || isCheckingUsername}
              className="w-full bg-[#843dff] hover:bg-[#7c3aeb] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-gray-400 hover:text-white"
              disabled={loading}
            >
              {isLogin ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};