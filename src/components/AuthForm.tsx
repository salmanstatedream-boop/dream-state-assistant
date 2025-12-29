import { useState } from 'react';
import { Eye, EyeOff, Loader2, MessageSquare, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  onSuccess: () => void;
}

interface FormFieldsProps {
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isLoading: boolean;
  isSignUp?: boolean;
}

// Password strength validation helper
const getPasswordStrength = (password: string) => {
  return {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

const PasswordRequirements = ({ password }: { password: string }) => {
  const strength = getPasswordStrength(password);
  return (
    <div className="mt-2 space-y-1 text-xs">
      <RequirementItem met={strength.minLength} text="At least 12 characters" />
      <RequirementItem met={strength.hasUppercase} text="One uppercase letter" />
      <RequirementItem met={strength.hasLowercase} text="One lowercase letter" />
      <RequirementItem met={strength.hasNumber} text="One number" />
      <RequirementItem met={strength.hasSpecial} text="One special character" />
    </div>
  );
};

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
    {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    {text}
  </div>
);

const FormFields = ({
  onSubmit,
  buttonText,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  isSignUp = false,
}: FormFieldsProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium">
        Email
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        autoComplete="email"
        className="focus:ring-2 focus:ring-primary/50 focus:border-primary"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="password" className="text-sm font-medium">
        Password
      </Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          className="focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      {isSignUp && password && <PasswordRequirements password={password} />}
    </div>
    <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  </form>
);
      </div>
    </div>
    <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  </form>
);

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const validateInputs = () => {
    if (!email.trim()) {
      toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive' });
      return false;
    }
    // RFC 5322 simplified email validation
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return false;
    }
    
    // Strong password validation: minimum 12 characters with complexity requirements
    if (password.length < 12) {
      toast({ title: 'Password too short', description: 'Password must be at least 12 characters.', variant: 'destructive' });
      return false;
    }
    
    // Require at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      toast({ title: 'Weak password', description: 'Password must contain at least one uppercase letter.', variant: 'destructive' });
      return false;
    }
    
    // Require at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      toast({ title: 'Weak password', description: 'Password must contain at least one lowercase letter.', variant: 'destructive' });
      return false;
    }
    
    // Require at least one number
    if (!/\d/.test(password)) {
      toast({ title: 'Weak password', description: 'Password must contain at least one number.', variant: 'destructive' });
      return false;
    }
    
    // Require at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      toast({ title: 'Weak password', description: 'Password must contain at least one special character (!@#$%^&* etc).', variant: 'destructive' });
      return false;
    }
    
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      } else {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) {
        if (error.message.includes('already registered')) {
          toast({ title: 'Account exists', description: 'This email is already registered. Try signing in.', variant: 'destructive' });
        } else {
          toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
        }
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link. Please check your inbox.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:p-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
          <MessageSquare className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dream State</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Property Management Assistant</p>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin" className="text-sm sm:text-base">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className="text-sm sm:text-base">
            Create Account
          </TabsTrigger>
        </TabsList>
        <TabsContent value="signin" key="signin">
          <FormFields
            onSubmit={handleSignIn}
            buttonText="Sign In"
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            isSignUp={false}
          />
        </TabsContent>
        <TabsContent value="signup" key="signup">
          <FormFields
            onSubmit={handleSignUp}
            buttonText="Create Account"
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            isSignUp={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
