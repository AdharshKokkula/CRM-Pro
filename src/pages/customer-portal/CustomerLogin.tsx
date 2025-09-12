import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Loader2, Mail, Lock, CheckCircle } from 'lucide-react';

export default function CustomerLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
  });
  const [showSetupComplete, setShowSetupComplete] = useState(searchParams.get('setup') === 'complete');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/customer-portal/dashboard');
      }
    };
    checkAuth();

    // Show password setup for users coming from email links
    if (formData.email && !showSetupComplete) {
      setNeedsPasswordSetup(true);
    }

    // Show setup complete message briefly
    if (showSetupComplete) {
      const timer = setTimeout(() => setShowSetupComplete(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [navigate, showSetupComplete, formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      navigate('/customer-portal/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.email.split('@')[0],
            user_type: 'customer',
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Password Created Successfully',
        description: 'You can now sign in with your new password.',
      });

      setIsRegistering(false);
      setNeedsPasswordSetup(false);
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to create password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Customer Portal</CardTitle>
          <CardDescription>
            {isRegistering ? 'Create your password' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {showSetupComplete && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">Password set successfully! You can now sign in.</p>
            </div>
          )}
          
          {needsPasswordSetup && !isRegistering && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Welcome! It looks like this is your first time accessing the portal. 
                Please create a password to get started.
              </p>
              <Button 
                onClick={() => setIsRegistering(true)} 
                className="mt-2 w-full"
                size="sm"
              >
                Create Password
              </Button>
            </div>
          )}
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegistering ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {!needsPasswordSetup && (
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm"
              >
                {isRegistering 
                  ? 'Already have an account? Sign in' 
                  : 'New customer? Create account'
                }
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}