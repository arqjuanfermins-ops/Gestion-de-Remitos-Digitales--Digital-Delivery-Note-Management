import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Remito, View, User, Work } from '../types';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Printer, ArrowLeft } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useToast } from '../hooks/useToast';
import Modal from '../components/ui/Modal';

interface RemitoDetailPageProps {
    setView: (view: View) => void;
    remitoId: string;
}

const RemitoDetailPage: React.FC<RemitoDetailPageProps> = ({ setView, remitoId }) => {
    const [remito, setRemito] = useState<Remito | null>(null);
    const [createdBy, setCreatedBy] = useState<User | null>(null);
    const [destination, setDestination] = useState<Work | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const { addToast } = useToast();
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const remitoData = await api.getRemitoById(remitoId);
                setRemito(remitoData);
                if (remitoData) {
                    const [userData, workData] = await Promise.all([
                        api.getUserById(remitoData.createdById),
                        api.getWorkById(remitoData.destinationId)
                    ]);
                    setCreatedBy(userData);
                    setDestination(workData);
                }
            } catch (error) {
                addToast('Error al cargar el remito.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remitoId]);

    const handlePrint = () => {
        const element = printRef.current;
        if (element) {
            const opt = {
                margin:       0.5,
                filename:     `remito-${remito?.number}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            (window as any).html2pdf().from(element).set(opt).save();
        }
    };

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setIsImageModalOpen(true);
    }

    if (isLoading) return <Spinner />;
    if (!remito) return <p>Remito no encontrado.</p>;

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                 <Button variant="secondary" onClick={() => setView({ page: 'dashboard' })}>
                    <ArrowLeft size={20} />
                    Volver
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold text-center order-first w-full sm:order-none sm:w-auto">Detalle del Remito</h1>
                <Button onClick={handlePrint}>
                    <Printer size={20} />
                    <span className="hidden sm:inline">Imprimir / PDF</span>
                </Button>
            </div>
            
            <div ref={printRef} className="p-0 sm:p-2 bg-gray-900 print:bg-white print:text-black">
                <Card className="!bg-gray-800 text-gray-100 print:!bg-white print:!text-black print:shadow-none">
                    <div className="border-b border-gray-700 pb-4 mb-4 print:border-gray-300">
                        <h2 className="text-2xl font-bold text-white print:text-black">Remito N°: {remito.number}</h2>
                        <p className="text-gray-400 print:text-gray-600">Fecha de Creación: {formatDate(remito.createdAt)}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p><strong className="text-gray-400 print:text-gray-600">Origen:</strong> {remito.origin}</p>
                            <p><strong className="text-gray-400 print:text-gray-600">Destino:</strong> {destination?.name}</p>
                            <p><strong className="text-gray-400 print:text-gray-600">Dirección:</strong> {destination?.address}</p>
                        </div>
                        <div>
                            <p><strong className="text-gray-400 print:text-gray-600">Creado por:</strong> {createdBy?.name}</p>
                            <p><strong className="text-gray-400 print:text-gray-600">Estado:</strong> <span className={`font-semibold ${
                                            remito.status === 'pendiente' ? 'text-yellow-400' :
                                            remito.status === 'en tránsito' ? 'text-blue-400' :
                                            'text-green-400'
                                        } print:text-black`}>{remito.status}</span></p>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4 border-t border-gray-700 pt-4 print:border-gray-300 print:text-black">Ítems</h3>
                    <div className="space-y-4">
                        {remito.items.map((item, index) => (
                            <div key={index} className="p-4 bg-gray-700/50 rounded-lg print:bg-gray-100 print:border print:border-gray-200">
                                <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                                    <div>
                                        <p className="font-bold text-lg print:text-black">{item.name}</p>
                                        <p><strong className="text-gray-400 print:text-gray-600">Cantidad:</strong> {item.quantity}</p>
                                        {item.observations && <p><strong className="text-gray-400 print:text-gray-600">Observaciones:</strong> {item.observations}</p>}
                                    </div>
                                    <div className="flex flex-wrap gap-2 print:hidden">
                                        {item.photos.map((photo, pIndex) => (
                                            <img key={pIndex} src={photo} alt={`Foto ${pIndex}`} className="w-20 h-20 object-cover rounded cursor-pointer" onClick={() => openImageModal(photo)} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-xl font-bold mb-4 mt-6 border-t border-gray-700 pt-4 print:border-gray-300 print:text-black">Firmas</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold mb-2 print:text-black">Firma del Emisor</h4>
                            {remito.senderSignature ? <img src={remito.senderSignature} alt="Firma Emisor" className="bg-white rounded p-2 max-w-full sm:max-w-xs" /> : <p className="text-gray-500 print:text-gray-600">Sin firma</p>}
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 print:text-black">Firma del Receptor</h4>
                            {remito.receiverSignature ? <img src={remito.receiverSignature} alt="Firma Receptor" className="bg-white rounded p-2 max-w-full sm:max-w-xs" /> : <p className="text-gray-500 print:text-gray-600">Sin firma</p>}
                        </div>
                    </div>
                </Card>
            </div>
            
            <Modal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} title="Vista Previa de Imagen">
                <img src={selectedImage} alt="Vista ampliada" className="max-w-full max-h-[70vh] mx-auto" />
            </Modal>
        </div>
    );
};

export default RemitoDetailPage;