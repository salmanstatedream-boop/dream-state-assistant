import { LogOut, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  userEmail: string;
  onSignOut: () => void;
  onNewChat: () => void;
}

export function Navbar({ userEmail, onSignOut, onNewChat }: NavbarProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground hidden sm:inline">
          Dream State
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onNewChat} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="max-w-[200px]">
              <span className="truncate">{userEmail}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
