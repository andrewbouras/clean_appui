import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Home,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname?.startsWith(path);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/portal',
      icon: Home,
    },
    {
      name: 'Classes',
      href: '/portal/classes',
      icon: BookOpen,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-background border-r">
        <div className="flex flex-col flex-grow pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-2xl font-bold text-primary">Smartify</span>
          </div>
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="flex-shrink-0 px-4 py-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={() => router.push('/signout')}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-16">
          <span className="text-2xl font-bold text-primary">Smartify</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4 space-y-2">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                ))}
                <div className="pt-4 border-t space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => router.push('/signout')}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1",
        "lg:pl-64", // Offset for desktop sidebar
        "pt-16 lg:pt-0", // Offset for mobile header
      )}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
} 