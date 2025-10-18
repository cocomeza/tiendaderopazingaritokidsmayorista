'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { Loading } from '@/components/ui/Loading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Verificando permisos..." />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Productos', href: '/admin/productos' },
    { icon: ShoppingCart, label: 'Pedidos', href: '/admin/pedidos' },
    { icon: Users, label: 'Clientes', href: '/admin/clientes' },
    { icon: BarChart3, label: 'Reportes', href: '/admin/reportes' },
    { icon: Settings, label: 'Configuración', href: '/admin/configuracion' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900 text-white fixed h-screen">
          <div className="p-6 border-b border-gray-800">
            <Link href="/admin">
              <h1 className="text-xl font-extrabold">
                <span className="text-[#7B3FBD]">Zingarito</span>{' '}
                <span className="text-[#00D9D4]">Kids</span>
              </h1>
            </Link>
            <p className="text-sm text-gray-400 mt-1">Panel de Administración</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white mb-2"
            >
              <span>← Volver al Sitio</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900 transition-colors text-gray-400 hover:text-white w-full"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

