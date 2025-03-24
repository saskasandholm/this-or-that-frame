'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart, 
  Users, 
  FileText, 
  Settings, 
  Shield, 
  PlusCircle,
  Calendar,
  Activity,
  Home
} from 'lucide-react';

interface AdminSidebarProps {
  role: string;
  permissions: Record<string, boolean>;
}

export default function AdminSidebar({ role, permissions }: AdminSidebarProps) {
  const pathname = usePathname() || '';
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { 
      href: '/admin', 
      label: 'Dashboard', 
      icon: <BarChart className="w-5 h-5" />,
      permission: 'viewStats'
    },
    { 
      href: '/admin/topics', 
      label: 'Manage Topics', 
      icon: <FileText className="w-5 h-5" />,
      permission: 'manageTopics'
    },
    { 
      href: '/admin/users', 
      label: 'Users', 
      icon: <Users className="w-5 h-5" />,
      permission: 'manageUsers'
    },
    { 
      href: '/admin/submissions', 
      label: 'Submissions', 
      icon: <PlusCircle className="w-5 h-5" />,
      permission: 'moderateContent'
    },
    { 
      href: '/admin/activity', 
      label: 'User Activity', 
      icon: <Activity className="w-5 h-5" />,
      permission: 'viewStats'
    },
    { 
      href: '/admin/scheduling', 
      label: 'Scheduling', 
      icon: <Calendar className="w-5 h-5" />,
      permission: 'manageTopics'
    }
  ];
  
  // Only show admin management for super admins
  if (role === 'SUPER_ADMIN') {
    navItems.push({ 
      href: '/admin/admins', 
      label: 'Manage Admins', 
      icon: <Shield className="w-5 h-5" />,
      permission: 'manageAdmins'
    });
  }
  
  navItems.push({ 
    href: '/admin/settings', 
    label: 'Settings', 
    icon: <Settings className="w-5 h-5" />,
    permission: 'viewStats'  // Everyone can see settings
  });
  
  return (
    <nav className="admin-sidebar bg-background border-r border-border w-64 h-screen flex flex-col">
      <div className="admin-logo mb-6 p-6 border-b border-border">
        <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
        <p className="text-sm text-muted-foreground uppercase">{role.replace('_', ' ')}</p>
      </div>
      
      <ul className="space-y-1 flex-1 px-3">
        {navItems.map((item) => {
          // Skip if user doesn't have permission
          if (!permissions[item.permission] && role !== 'SUPER_ADMIN') {
            return null;
          }
          
          return (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive(item.href) 
                    ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className={`mr-3 ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-auto mb-4 px-3">
        <Link 
          href="/"
          className="flex items-center px-4 py-3 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Home className="w-5 h-5 mr-3" />
          <span>Back to Site</span>
        </Link>
      </div>
    </nav>
  );
} 