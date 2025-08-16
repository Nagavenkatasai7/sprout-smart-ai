import { useState, useEffect } from 'react';
import { User, LogOut, CreditCard, Crown, Calendar, Home, Heart, BookOpen, Stethoscope, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Profile {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const UserNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkSubscription();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (data && !error) {
      setProfile(data);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const { data } = await supabase.functions.invoke("check-subscription");
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    return profile?.full_name || profile?.username || user?.email || 'User';
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} alt={getDisplayName()} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {subscription && (
              <Badge variant="secondary" className="w-fit mt-1">
                {subscription.subscribed ? 
                  (subscription.subscription_tier === "Pro" ? <Crown className="h-3 w-3 mr-1" /> : null) :
                  null
                }
                {subscription.subscribed ? `${subscription.subscription_tier} Plan` : "Free Plan"}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/my-garden')}>
          <Home className="mr-2 h-4 w-4" />
          <span>My Garden</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/plant-calendar')}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>Care Calendar</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/plant-matchmaker')}>
          <Heart className="mr-2 h-4 w-4" />
          <span>Plant Matchmaker</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/growing-programs')}>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Growing Programs</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/plant-doctor')}>
          <Stethoscope className="mr-2 h-4 w-4" />
          <span>Plant Doctor</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/community-marketplace')}>
          <Users className="mr-2 h-4 w-4" />
          <span>Community</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/account')}>
          <User className="mr-2 h-4 w-4" />
          <span>Account & Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/pricing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Subscription Plans</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};