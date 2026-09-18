import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { cn } from '@utils/format';
import { Button } from '@components/ui/Button';

const customerLinks = [
  { to: '/', label: 'Home', icon: FiHome, end: true },
  { to: '/bookings', label: 'Bookings', icon: FiCalendar },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

const ownerLinks = [
  { to: '/owner', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/owner/properties', label: 'My House', icon: FiGrid },
  { to: '/owner/bookings', label: 'Bookings', icon: FiCalendar },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? ownerLinks : customerLinks;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,0,0.08),_transparent_40%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-brand-border bg-brand-charcoal/80 p-5 backdrop-blur lg:flex">
          <div className="mb-8">
            <p className="font-display text-2xl font-bold tracking-tight">
              Rental<span className="text-brand-orange">Base</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {isAdmin ? 'Admin workspace' : 'Book the house'}
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-orange/15 text-brand-orange shadow-glow-sm'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-brand-border pt-4">
            <div>
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs capitalize text-gray-500">{user?.role}</p>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleLogout}>
              <FiLogOut />
              Log out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-border bg-brand-black/90 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-brand-border p-2 text-gray-300 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <div>
                <p className="font-display text-lg font-semibold lg:hidden">
                  Rental<span className="text-brand-orange">Base</span>
                </p>
                <p className="hidden text-sm text-gray-400 lg:block">
                  Welcome back,{' '}
                  <span className="text-white">{user?.name?.split(' ')[0]}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={handleLogout}
            >
              <FiLogOut />
              Log out
            </Button>
          </header>

          <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-border bg-brand-charcoal/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium',
                  isActive ? 'text-brand-orange' : 'text-gray-500'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-brand-charcoal p-5 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-xl font-bold">
                Rental<span className="text-brand-orange">Base</span>
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-gray-400"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                      isActive
                        ? 'bg-brand-orange/15 text-brand-orange'
                        : 'text-gray-300'
                    )
                  }
                >
                  <Icon />
                  {label}
                </NavLink>
              ))}
            </nav>
            <Button
              variant="secondary"
              className="mt-auto"
              onClick={handleLogout}
            >
              <FiLogOut />
              Log out
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
