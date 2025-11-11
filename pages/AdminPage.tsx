import React, { useState, useEffect } from 'react';
import { User, Work, View, UserRole } from '../types';
import { api } from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface AdminPageProps {
  setView: (view: View) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'works'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string } | null>(null);
  const [editingWork, setEditingWork] = useState<Partial<Work> | null>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersData, worksData] = await Promise.all([api.getUsers(), api.getWorks()]);
      setUsers(usersData);
      setWorks(worksData);
    } catch (error) {
      addToast('Error al cargar datos de administración.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (type: 'user' | 'work', item?: User | Work) => {
    if (type === 'user') {
      setEditingUser(item || { role: 'user', assignedWorks: []});
    } else {
      setEditingWork(item || { assignedUsers: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setEditingWork(null);
  };

  const handleUserSave = async () => {
    if (!editingUser) return;
    try {
      if (editingUser.id) {
        await api.updateUser(editingUser.id, editingUser);
        addToast('Usuario actualizado.', 'success');
      } else {
        await api.createUser(editingUser);
        addToast('Usuario creado.', 'success');
      }
      fetchData();
      closeModal();
    } catch (error) {
      addToast(`Error: ${(error as Error).message}`, 'error');
    }
  };

  const handleWorkSave = async () => {
    if (!editingWork) return;
    try {
      if (editingWork.id) {
        await api.updateWork(editingWork.id, editingWork);
        addToast('Obra actualizada.', 'success');
      } else {
        await api.createWork(editingWork);
        addToast('Obra creada.', 'success');
      }
      fetchData();
      closeModal();
    } catch (error) {
        addToast(`Error: ${(error as Error).message}`, 'error');
    }
  };

  const handleDelete = async (type: 'user' | 'work', id: string) => {
    const confirmation = window.confirm(`¿Estás seguro de que quieres eliminar est${type === 'user' ? 'e usuario' : 'a obra'}?`);
    if (confirmation) {
      try {
        if (type === 'user') await api.deleteUser(id);
        else await api.deleteWork(id);
        addToast(`${type === 'user' ? 'Usuario' : 'Obra'} eliminad${type === 'user' ? 'o' : 'a'}.`, 'success');
        fetchData();
      } catch (error) {
        addToast('Error al eliminar.', 'error');
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'works' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('works')}
        >
          Obras
        </button>
      </div>

      {isLoading ? <Spinner /> : (
        <>
          {activeTab === 'users' && (
            <div>
              <div className="text-right mb-4">
                <Button onClick={() => openModal('user')}><PlusCircle size={20}/> Nuevo Usuario</Button>
              </div>
              
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                  {users.map(user => (
                      <Card key={user.id} className="!p-4">
                          <div className="flex justify-between items-start">
                              <div>
                                  <p className="font-bold">{user.name}</p>
                                  <p className="text-sm text-gray-400">{user.email}</p>
                              </div>
                              <span className="text-xs bg-gray-600 px-2 py-1 rounded">{user.role}</span>
                          </div>
                          <div className="mt-2 text-sm">
                              <strong className="text-gray-500">Obras: </strong>
                              {user.assignedWorks.map(id => works.find(w => w.id === id)?.name).join(', ') || 'Ninguna'}
                          </div>
                          <div className="flex gap-2 mt-4 border-t pt-4 border-gray-700">
                              <Button size="sm" onClick={() => openModal('user', user)} className="flex-1"><Edit size={16}/> Editar</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDelete('user', user.id)} className="flex-1"><Trash2 size={16}/> Borrar</Button>
                          </div>
                      </Card>
                  ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Obras Asignadas</th>
                      <th className="p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-gray-700">
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4 capitalize">{user.role}</td>
                        <td className="p-4">{user.assignedWorks.map(id => works.find(w => w.id === id)?.name).join(', ')}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => openModal('user', user)}><Edit size={16}/></Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete('user', user.id)}><Trash2 size={16}/></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'works' && (
             <div>
              <div className="text-right mb-4">
                <Button onClick={() => openModal('work')}><PlusCircle size={20}/> Nueva Obra</Button>
              </div>

               {/* Mobile View */}
              <div className="md:hidden space-y-4">
                  {works.map(work => (
                      <Card key={work.id} className="!p-4">
                          <div>
                              <p className="font-bold">{work.name}</p>
                              <p className="text-sm text-gray-400">{work.address}</p>
                          </div>
                           <div className="mt-2 text-sm">
                              <strong className="text-gray-500">Usuarios: </strong>
                              {work.assignedUsers.map(id => users.find(u => u.id === id)?.name).join(', ') || 'Ninguno'}
                          </div>
                          <div className="flex gap-2 mt-4 border-t pt-4 border-gray-700">
                              <Button size="sm" onClick={() => openModal('work', work)} className="flex-1"><Edit size={16}/> Editar</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDelete('work', work.id)} className="flex-1"><Trash2 size={16}/> Borrar</Button>
                          </div>
                      </Card>
                  ))}
              </div>
              
              {/* Desktop View */}
              <div className="hidden md:block bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Dirección</th>
                      <th className="p-4">Usuarios Asignados</th>
                      <th className="p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.map(work => (
                      <tr key={work.id} className="border-b border-gray-700">
                        <td className="p-4">{work.name}</td>
                        <td className="p-4">{work.address}</td>
                        <td className="p-4">{work.assignedUsers.map(id => users.find(u => u.id === id)?.name).join(', ')}</td>
                        <td className="p-4">
                           <div className="flex gap-2">
                            <Button size="sm" onClick={() => openModal('work', work)}><Edit size={16}/></Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete('work', work.id)}><Trash2 size={16}/></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Gestionar Usuario' : 'Gestionar Obra'}>
        {editingUser && (
            <div className="space-y-4">
                <Input placeholder="Nombre" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required />
                <Input type="email" placeholder="Email" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} required />
                <Input type="password" placeholder={editingUser.id ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña"} onChange={e => setEditingUser({...editingUser, password: e.target.value})} required={!editingUser.id} />
                <Select value={editingUser.role || 'user'} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}>
                    <option value="user">Usuario</option>
                    <option value="admin">Admin</option>
                </Select>
                 <div>
                    <label className="block mb-2">Obras Asignadas</label>
                    <select multiple className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 h-40" value={editingUser.assignedWorks || []} onChange={e => setEditingUser({...editingUser, assignedWorks: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})}>
                        {works.map(work => <option key={work.id} value={work.id}>{work.name}</option>)}
                    </select>
                </div>
                <Button onClick={handleUserSave}>Guardar</Button>
            </div>
        )}
        {editingWork && (
            <div className="space-y-4">
                <Input placeholder="Nombre de la Obra" value={editingWork.name || ''} onChange={e => setEditingWork({...editingWork, name: e.target.value})} required />
                <Input placeholder="Dirección" value={editingWork.address || ''} onChange={e => setEditingWork({...editingWork, address: e.target.value})} required />
                 <div>
                    <label className="block mb-2">Usuarios Asignados</label>
                    <select multiple className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 h-40" value={editingWork.assignedUsers || []} onChange={e => setEditingWork({...editingWork, assignedUsers: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})}>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                </div>
                <Button onClick={handleWorkSave}>Guardar</Button>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPage;