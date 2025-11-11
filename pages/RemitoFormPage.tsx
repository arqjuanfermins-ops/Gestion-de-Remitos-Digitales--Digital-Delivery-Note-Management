import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { Remito, Work, View } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import { fileToBase64 } from '../utils/helpers';
import SignatureCanvas from 'react-signature-canvas';
import { Plus, Trash2, Camera, Eraser, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface RemitoFormPageProps {
  setView: (view: View) => void;
  remitoId?: string;
}

const RemitoFormPage: React.FC<RemitoFormPageProps> = ({ setView, remitoId }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [works, setWorks] = useState<Work[]>([]);
  const [remito, setRemito] = useState<Partial<Remito>>({
    origin: 'Fábrica',
    items: [{ id: `item-${Date.now()}`, name: '', quantity: 1, photos: [] }],
    status: 'pendiente',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [newWork, setNewWork] = useState({ name: '', address: '' });

  const senderSigRef = useRef<SignatureCanvas>(null);
  const receiverSigRef = useRef<SignatureCanvas>(null);
  
  const isEditMode = Boolean(remitoId);

  const loadWorks = useCallback(async () => {
    try {
        const allWorks = await api.getWorks();
        const userWorks = user?.role === 'admin' ? allWorks : allWorks.filter(w => user?.assignedWorks.includes(w.id));
        setWorks(userWorks);
    } catch (error) {
         addToast('Error al cargar las obras.', 'error');
    }
  }, [user, addToast]);

  useEffect(() => {
    const loadRemitoData = async () => {
        if (isEditMode) {
            try {
                const existingRemito = await api.getRemitoById(remitoId!);
                setRemito(existingRemito);
            } catch (error) {
                addToast('Error al cargar el remito.', 'error');
            }
        } else {
            setRemito(prev => ({ ...prev, createdById: user!.id }))
        }
    };

    const loadInitialData = async () => {
        setIsDataLoading(true);
        await Promise.all([
            loadWorks(),
            loadRemitoData()
        ]);
        setIsDataLoading(false);
    };
    
    loadInitialData();
  }, [remitoId, user, isEditMode, addToast, loadWorks]);

  const handleRemitoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRemito({ ...remito, [name]: value });
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const items = [...remito.items!];
    items[index] = { ...items[index], [name]: name === 'quantity' ? Number(value) : value };
    setRemito({ ...remito, items });
  };

  const handlePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const files = Array.from(e.target.files);
        const base64Photos = await Promise.all(files.map(fileToBase64));
        const items = [...remito.items!];
        items[index].photos = [...items[index].photos, ...base64Photos];
        setRemito({ ...remito, items });
      } catch (error) {
        addToast('Error al cargar la imagen.', 'error');
      }
    }
  };

  const removePhoto = (itemIndex: number, photoIndex: number) => {
    const items = [...remito.items!];
    items[itemIndex].photos.splice(photoIndex, 1);
    setRemito({ ...remito, items });
  };

  const addItem = () => {
    setRemito({ ...remito, items: [...remito.items!, { id: `item-${Date.now()}`, name: '', quantity: 1, photos: [] }] });
  };

  const removeItem = (index: number) => {
    const items = remito.items!.filter((_, i) => i !== index);
    setRemito({ ...remito, items });
  };

  const clearSignature = (sigRef: React.RefObject<SignatureCanvas>) => {
    sigRef.current?.clear();
  };
  
  const handleCreateWork = async () => {
    if (!newWork.name || !newWork.address) {
        addToast('El nombre y la dirección son obligatorios.', 'error');
        return;
    }
    try {
        const createdWork = await api.createWork(newWork);
        addToast('Destino creado correctamente.', 'success');
        
        await loadWorks();
        setRemito(prev => ({ ...prev, destinationId: createdWork.id }));

        setNewWork({ name: '', address: '' });
        setIsWorkModalOpen(false);

    } catch (error) {
        addToast(`Error al crear el destino: ${(error as Error).message}`, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const senderSignature = senderSigRef.current && !senderSigRef.current.isEmpty() ? senderSigRef.current.getTrimmedCanvas().toDataURL('image/png') : remito.senderSignature;
    const receiverSignature = receiverSigRef.current && !receiverSigRef.current.isEmpty() ? receiverSigRef.current.getTrimmedCanvas().toDataURL('image/png') : remito.receiverSignature;

    if (!isEditMode && !senderSignature) {
        addToast('La firma del emisor es obligatoria.', 'error');
        setIsLoading(false);
        return;
    }

    const remitoData: Partial<Remito> = {
        ...remito,
        senderSignature,
        receiverSignature,
    };
    
    // Automatically update status to 'recibido' if both signatures are present
    if (remitoData.senderSignature && remitoData.receiverSignature) {
        remitoData.status = 'recibido';
    }

    try {
        if (isEditMode) {
            await api.updateRemito(remitoId!, remitoData);
            addToast('Remito actualizado correctamente.', 'success');
        } else {
            await api.createRemito(remitoData);
            addToast('Remito creado correctamente.', 'success');
        }
        setView({ page: 'dashboard' });
    } catch (error) {
        addToast(`Error al guardar el remito: ${(error as Error).message}`, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  if (isDataLoading) return <Spinner />;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-bold">{isEditMode ? 'Editar Remito' : 'Crear Remito'}</h1>

          <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block mb-2 font-semibold">Origen</label>
                      <Select name="origin" value={remito.origin} onChange={handleRemitoChange}>
                          <option>Fábrica</option>
                          <option>Depósito</option>
                      </Select>
                  </div>
                  <div>
                      <label className="block mb-2 font-semibold">Destino (Obra)</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-grow">
                          <Select name="destinationId" value={remito.destinationId || ''} onChange={handleRemitoChange} required>
                              <option value="">Seleccione una obra</option>
                              {works.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </Select>
                        </div>
                        {user?.role === 'admin' && (
                           <Button type="button" variant="secondary" onClick={() => setIsWorkModalOpen(true)} className="flex-shrink-0 !p-2" title="Crear nuevo destino">
                              <Plus size={20} />
                           </Button>
                        )}
                      </div>
                  </div>
                  <div>
                      <label className="block mb-2 font-semibold">Estado</label>
                      <Select name="status" value={remito.status} onChange={handleRemitoChange}>
                          <option value="pendiente">Pendiente</option>
                          <option value="en tránsito">En Tránsito</option>
                          <option value="recibido">Recibido</option>
                      </Select>
                  </div>
              </div>
          </Card>

          <Card>
              <h2 className="text-xl font-bold mb-4">Ítems</h2>
              <div className="space-y-4">
                  {remito.items?.map((item, index) => (
                      <div key={item.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-5">
                                  <label className="block text-sm mb-1">Nombre del Ítem</label>
                                  <Input name="name" value={item.name} onChange={e => handleItemChange(index, e)} required />
                              </div>
                              <div className="md:col-span-2">
                                  <label className="block text-sm mb-1">Cantidad</label>
                                  <Input name="quantity" type="number" value={item.quantity} onChange={e => handleItemChange(index, e)} required min="1" />
                              </div>
                              <div className="md:col-span-5">
                                  <label className="block text-sm mb-1">Observaciones</label>
                                  <Input name="observations" value={item.observations || ''} onChange={e => handleItemChange(index, e)} />
                              </div>
                              <div className="md:col-span-12">
                                  <label className="block text-sm mb-1">Fotos</label>
                                  <div className="flex items-center gap-4">
                                      <label htmlFor={`photo-upload-${index}`} className="cursor-pointer">
                                          <div className="flex items-center gap-2 p-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white">
                                              <Camera size={18}/>
                                              <span>Añadir</span>
                                          </div>
                                          <input id={`photo-upload-${index}`} type="file" multiple accept="image/*" className="hidden" onChange={e => handlePhotoUpload(index, e)} />
                                      </label>
                                      <div className="flex flex-wrap gap-2">
                                          {item.photos.map((photo, pIndex) => (
                                              <div key={pIndex} className="relative">
                                                  <img src={photo} alt={`preview ${pIndex}`} className="w-16 h-16 object-cover rounded" />
                                                  <button type="button" onClick={() => removePhoto(index, pIndex)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5">
                                                      <X size={12} />
                                                  </button>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                          {remito.items!.length > 1 && (
                              <div className="text-right mt-2">
                                  <Button type="button" variant="danger" size="sm" onClick={() => removeItem(index)}>
                                      <Trash2 size={16} /> Quitar Ítem
                                  </Button>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
              <Button type="button" variant="secondary" onClick={addItem} className="mt-4"><Plus size={16}/> Añadir Ítem</Button>
          </Card>
          
          <Card>
              <h2 className="text-xl font-bold mb-4">Firmas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <h3 className="font-semibold mb-2">Firma del Emisor</h3>
                      {remito.senderSignature ? <img src={remito.senderSignature} alt="Firma Emisor" className="bg-white rounded" /> : (
                          <>
                            <div className="bg-white rounded-md border border-gray-300">
                                <SignatureCanvas ref={senderSigRef} canvasProps={{ className: 'w-full h-40' }} />
                            </div>
                            <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => clearSignature(senderSigRef)}><Eraser size={16}/> Limpiar</Button>
                          </>
                      )}
                  </div>
                  <div>
                      <h3 className="font-semibold mb-2">Firma del Receptor</h3>
                      {remito.receiverSignature ? <img src={remito.receiverSignature} alt="Firma Receptor" className="bg-white rounded" /> : (
                          <>
                            <div className="bg-white rounded-md border border-gray-300">
                                <SignatureCanvas ref={receiverSigRef} canvasProps={{ className: 'w-full h-40' }} />
                            </div>
                              <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => clearSignature(receiverSigRef)}><Eraser size={16}/> Limpiar</Button>
                          </>
                      )}
                  </div>
              </div>
          </Card>

          <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={() => setView({ page: 'dashboard' })}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Remito'}</Button>
          </div>
      </form>

      <Modal isOpen={isWorkModalOpen} onClose={() => setIsWorkModalOpen(false)} title="Crear Nuevo Destino (Obra)">
          <div className="space-y-4">
              <Input 
                  placeholder="Nombre de la Obra"
                  value={newWork.name}
                  onChange={e => setNewWork({...newWork, name: e.target.value})}
                  required
              />
              <Input 
                  placeholder="Dirección"
                  value={newWork.address}
                  onChange={e => setNewWork({...newWork, address: e.target.value})}
                  required
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsWorkModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateWork}>Guardar Destino</Button>
              </div>
          </div>
      </Modal>
    </>
  );
};

export default RemitoFormPage;
