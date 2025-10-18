'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Profile } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';
import { Search, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientesAdminPage() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Cargando clientes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Clientes</h1>
        <p className="text-gray-600 mt-1">Lista de todos los clientes registrados</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Total Clientes</p>
          <p className="text-3xl font-bold text-[#7B3FBD]">{clients.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Nuevos este mes</p>
          <p className="text-3xl font-bold text-[#00D9D4]">
            {clients.filter(c => {
              const created = new Date(c.created_at);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Con Datos Completos</p>
          <p className="text-3xl font-bold text-green-600">
            {clients.filter(c => c.full_name && c.phone && c.address).length}
          </p>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="search"
            placeholder="Buscar por nombre, email o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            fullWidth
          />
        </div>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {client.full_name || 'Sin nombre'}
                </h3>
                <p className="text-sm text-gray-500">
                  Registro: {formatDate(client.created_at, 'dd/MM/yyyy')}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {client.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <a href={`mailto:${client.email}`} className="hover:text-[#7B3FBD]">
                      {client.email}
                    </a>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <a href={`tel:${client.phone}`} className="hover:text-[#7B3FBD]">
                      {client.phone}
                    </a>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{client.address}</p>
                      <p>{client.city}, {client.province}</p>
                      {client.postal_code && <p>CP: {client.postal_code}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            {searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados todavía'}
          </p>
        </Card>
      )}
    </div>
  );
}

