import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Remito, View, User, Work, RemitoStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import { PlusCircle, Edit, Eye, Trash2, FileDown } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

interface DashboardProps {
    setView: (view: View) => void;
}

const DashboardPage: React.FC<DashboardProps> = ({ setView }) => {
    const [remitos, setRemitos] = useState<Remito[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [works, setWorks] = useState<Work[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { addToast } = useToast();

    // Filters
    const [filters, setFilters] = useState({
        workId: '',
        userId: '',
        item: '',
        startDate: '',
        endDate: '',
        status: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [remitosData, usersData, worksData] = await Promise.all([
                    api.getRemitos(filters),
                    api.getUsers(),
                    api.getWorks()
                ]);
                setRemitos(remitosData);
                setUsers(usersData);
                setWorks(worksData);
            } catch (error) {
                console.error("Failed to fetch data", error);
                addToast('Error al cargar los datos.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        setFilters({ workId: '', userId: '', item: '', startDate: '', endDate: '', status: '' });
    };
    
    const handleDelete = async (remitoId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este remito?')) {
            try {
                await api.deleteRemito(remitoId);
                setRemitos(remitos.filter(r => r.id !== remitoId));
                addToast('Remito eliminado correctamente.', 'success');
            } catch (error) {
                addToast('Error al eliminar el remito.', 'error');
            }
        }
    };

    const exportToCSV = () => {
        if (remitos.length === 0) {
            addToast('No hay datos para exportar.', 'info');
            return;
        }

        const headers = ['Numero', 'Fecha', 'Origen', 'Destino', 'Creado Por', 'Estado', 'Items'];
        const rows = remitos.map(remito => [
            remito.number,
            formatDate(remito.createdAt),
            remito.origin,
            getWorkName(remito.destinationId),
            getUserName(remito.createdById),
            remito.status,
            remito.items.map(item => `${item.name} (x${item.quantity})`).join('; ')
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `remitos_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast('Exportación a CSV exitosa.', 'success');
    };

    const getWorkName = (workId: string) => works.find(w => w.id === workId)?.name || 'N/A';
    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'N/A';

    const StatusBadge: React.FC<{status: RemitoStatus}> = ({ status }) => (
         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            status === 'pendiente' ? 'bg-yellow-500/20 text-yellow-300' :
            status === 'en tránsito' ? 'bg-blue-500/20 text-blue-300' :
            'bg-green-500/20 text-green-300'
        }`}>
            {status}
        </span>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">Dashboard de Remitos</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={exportToCSV} variant="secondary" className="w-full sm:w-auto">
                        <FileDown size={20} />
                        Exportar a CSV
                    </Button>
                    <Button onClick={() => setView({ page: 'remito_new' })} className="w-full sm:w-auto">
                        <PlusCircle size={20} />
                        Crear Remito
                    </Button>
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Select name="workId" value={filters.workId} onChange={handleFilterChange}>
                        <option value="">Todas las Obras</option>
                        {works.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </Select>
                    <Select name="userId" value={filters.userId} onChange={handleFilterChange}>
                        <option value="">Todos los Usuarios</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </Select>
                    <Input name="item" value={filters.item} onChange={handleFilterChange} placeholder="Buscar por ítem..." />
                    <Select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">Todos los Estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en tránsito">En Tránsito</option>
                        <option value="recibido">Recibido</option>
                    </Select>
                    <div className="flex gap-2 items-center">
                        <label className="text-sm shrink-0">Desde:</label>
                        <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div className="flex gap-2 items-center">
                        <label className="text-sm shrink-0">Hasta:</label>
                        <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <Button variant="secondary" onClick={resetFilters}>Limpiar Filtros</Button>
                </div>
            </div>

            {isLoading ? <Spinner /> : (
                <>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                         {remitos.map(remito => (
                            <Card key={remito.id} className="!p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold font-mono">{remito.number}</p>
                                        <p className="text-sm text-gray-400">{getWorkName(remito.destinationId)}</p>
                                    </div>
                                    <StatusBadge status={remito.status} />
                                </div>
                                <div className="mt-4 text-sm text-gray-300">
                                    <p><strong className="text-gray-500">Creado por:</strong> {getUserName(remito.createdById)}</p>
                                    <p><strong className="text-gray-500">Fecha:</strong> {formatDate(remito.createdAt)}</p>
                                </div>
                                <div className="flex gap-2 mt-4 border-t border-gray-700 pt-4">
                                    <Button size="sm" variant="secondary" onClick={() => setView({ page: 'remito_detail', id: remito.id })} className="flex-1">
                                        <Eye size={16} /> Ver
                                    </Button>
                                    {(user?.id === remito.createdById || user?.role === 'admin') && !(remito.senderSignature && remito.receiverSignature) && (
                                        <Button size="sm" onClick={() => setView({ page: 'remito_edit', id: remito.id })} className="flex-1">
                                            <Edit size={16} /> Editar
                                        </Button>
                                    )}
                                     {user?.role === 'admin' && (
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(remito.id)} className="flex-1">
                                            <Trash2 size={16} /> Borrar
                                        </Button>
                                     )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="p-4">Número</th>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Origen</th>
                                    <th className="p-4">Destino</th>
                                    <th className="p-4">Creado por</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {remitos.map(remito => (
                                    <tr key={remito.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-4 font-mono">{remito.number}</td>
                                        <td className="p-4">{formatDate(remito.createdAt)}</td>
                                        <td className="p-4">{remito.origin}</td>
                                        <td className="p-4">{getWorkName(remito.destinationId)}</td>
                                        <td className="p-4">{getUserName(remito.createdById)}</td>
                                        <td className="p-4">
                                            <StatusBadge status={remito.status} />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => setView({ page: 'remito_detail', id: remito.id })}>
                                                    <Eye size={16} />
                                                </Button>
                                                {(user?.id === remito.createdById || user?.role === 'admin') && !(remito.senderSignature && remito.receiverSignature) && (
                                                    <Button size="sm" onClick={() => setView({ page: 'remito_edit', id: remito.id })}>
                                                        <Edit size={16} />
                                                    </Button>
                                                )}
                                                 {user?.role === 'admin' && (
                                                    <Button size="sm" variant="danger" onClick={() => handleDelete(remito.id)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                 )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {remitos.length === 0 && <p className="p-4 text-center text-gray-400">No se encontraron remitos.</p>}
                </>
            )}
        </div>
    );
};

export default DashboardPage;