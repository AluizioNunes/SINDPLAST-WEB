'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    MapPin,
    Phone,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    Save,
    CheckCircle2,
    Camera,
    Upload,
    X,
} from 'lucide-react';
import { Empresa } from '@/lib/types/empresa';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Socio } from '@/lib/types/socio';
import toast from 'react-hot-toast';
import { createSocio, updateSocio, uploadSocioImage, updateSocioImage } from '@/lib/services/socioService';
import { getEmpresas } from '@/lib/services/empresaService';

interface SocioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    socio?: Socio | null;
}

const steps = [
    { id: 'pessoal', title: 'Dados Pessoais', icon: User },
    { id: 'endereco', title: 'Endereço', icon: MapPin },
    { id: 'contato', title: 'Contato', icon: Phone },
    { id: 'profissional', title: 'Dados Sindicais', icon: Briefcase },
];

const UF_LIST = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const formatCNPJ = (value: string) => {
    const cnpj = value.replace(/\D/g, '');
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
};

export default function SocioModal({ isOpen, onClose, onSuccess, socio }: SocioModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [formData, setFormData] = useState<Partial<Socio>>({
        status: 'ATIVO',
        nacionalidade: 'BRASILEIRA',
        sexo: 'MASCULINO',
        estadoCivil: 'SOLTEIRO(A)',
        carta: false,
        carteira: false,
        ficha: false,
    });
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const fetchEmpresas = async () => {
        try {
            const { data } = await getEmpresas({ limit: 1000 });
            setEmpresas(data);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchEmpresas();
        }
        if (socio) {
            setFormData(socio);
        } else {
            setFormData({
                status: 'ATIVO',
                nacionalidade: 'BRASILEIRA',
                sexo: 'MASCULINO',
                estadoCivil: 'SOLTEIRO(A)',
                carta: false,
                carteira: false,
                ficha: false,
            });
        }
        setCurrentStep(0);
        setPhotoFile(null);
        setCapturedBlob(null);
        setCameraOpen(false);
        setCameraError(null);
        setPhotoPreviewUrl(socio?.imagem || null);
    }, [socio, isOpen]);

    useEffect(() => {
        if (!cameraOpen) return;
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
        };
    }, [cameraOpen]);

    const openCamera = async () => {
        try {
            setCameraError(null);
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Câmera não suportada neste dispositivo.');
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            streamRef.current = stream;
            setCameraOpen(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (e: any) {
            setCameraError(e?.message || 'Erro ao acessar a câmera');
            setCameraOpen(false);
        }
    };

    const closeCamera = () => {
        setCameraOpen(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    };

    const capturePhoto = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92));
        if (!blob) return;
        closeCamera();
        setCapturedBlob(blob);
        setPhotoFile(null);
        if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(photoPreviewUrl);
        setPhotoPreviewUrl(URL.createObjectURL(blob));
    };

    const handlePhotoFile = (file: File | null) => {
        if (!file) return;
        setPhotoFile(file);
        setCapturedBlob(null);
        closeCamera();
        if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(photoPreviewUrl);
        setPhotoPreviewUrl(URL.createObjectURL(file));
    };

    const clearPhoto = () => {
        setPhotoFile(null);
        setCapturedBlob(null);
        if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(photoPreviewUrl);
        setPhotoPreviewUrl(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'cnpj') {
            const formattedCNPJ = formatCNPJ(value);
            const cleanCNPJ = formattedCNPJ.replace(/\D/g, '');
            const found = empresas.find(emp => emp.cnpj.replace(/\D/g, '') === cleanCNPJ);

            if (found) {
                setFormData(prev => ({
                    ...prev,
                    cnpj: formattedCNPJ,
                    nomeFantasia: found.nomeFantasia,
                    razaoSocial: found.razaoSocial,
                    codEmpresa: found.id.toString()
                }));
            } else {
                setFormData(prev => ({ ...prev, cnpj: formattedCNPJ }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEmpresaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const empresaId = e.target.value;
        const found = empresas.find(emp => emp.id.toString() === empresaId);
        if (found) {
            setFormData(prev => ({
                ...prev,
                nomeFantasia: found.nomeFantasia,
                razaoSocial: found.razaoSocial,
                cnpj: found.cnpj,
                codEmpresa: found.id.toString()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                nomeFantasia: '',
                razaoSocial: '',
                cnpj: '',
                codEmpresa: ''
            }));
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const saved = socio
                ? await updateSocio(socio.id, formData)
                : await createSocio(formData);

            if (photoFile || capturedBlob) {
                const fileOrBlob = (photoFile ?? capturedBlob) as Blob;
                const url = await uploadSocioImage(saved.id, fileOrBlob);
                await updateSocioImage(saved.id, url);
            }

            toast.success(socio ? 'Sócio atualizado!' : 'Sócio cadastrado!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar dados');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Pessoal
                return (
                    <div className="space-y-4 animate-fade-in text-gray-900 dark:text-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4">
                                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">
                                            Foto
                                        </div>
                                        {photoPreviewUrl && (
                                            <button
                                                type="button"
                                                onClick={clearPhoto}
                                                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                                                title="Remover"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                                        {photoPreviewUrl ? (
                                            <img src={photoPreviewUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                                                Sem foto
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handlePhotoFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="mt-3 grid grid-cols-1 gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full justify-center"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Selecionar arquivo
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={openCamera}
                                            className="w-full justify-center bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                                        >
                                            <Camera className="w-4 h-4 mr-2" />
                                            Tirar foto
                                        </Button>
                                    </div>
                                    {cameraError && (
                                        <div className="mt-3 text-xs text-red-600">
                                            {cameraError}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome Completo" name="nome" value={formData.nome || ''} onChange={handleChange} placeholder="NOME COMPLETO" required uppercase />
                            <Input label="CPF" name="cpf" value={formData.cpf || ''} onChange={handleChange} placeholder="000.000.000-00" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Data Nascimento" name="nascimento" type="date" value={formData.nascimento || ''} onChange={handleChange} />
                            <Input label="RG" name="rg" value={formData.rg || ''} onChange={handleChange} placeholder="Nº IDENTIDADE" />
                            <Input label="Órgão Emissor" name="emissor" value={formData.emissor || ''} onChange={handleChange} placeholder="SSP/AM" uppercase />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select label="Sexo" name="sexo" value={formData.sexo || ''} onChange={handleChange}>
                                <option value="MASCULINO" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>MASCULINO</option>
                                <option value="FEMININO" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>FEMININO</option>
                                <option value="OUTRO" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>OUTRO</option>
                            </Select>
                            <Select label="Estado Civil" name="estadoCivil" value={formData.estadoCivil || ''} onChange={handleChange}>
                                <option value="SOLTEIRO(A)" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>SOLTEIRO(A)</option>
                                <option value="CASADO(A)" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>CASADO(A)</option>
                                <option value="DIVORCIADO(A)" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>DIVORCIADO(A)</option>
                                <option value="VIÚVO(A)" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>VIÚVO(A)</option>
                                <option value="UNIÃO ESTÁVEL" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>UNIÃO ESTÁVEL</option>
                            </Select>
                            <Select label="Status" name="status" value={formData.status || ''} onChange={handleChange}>
                                <option value="ATIVO" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>ATIVO</option>
                                <option value="INATIVO" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>INATIVO</option>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome do Pai" name="pai" value={formData.pai || ''} onChange={handleChange} placeholder="NOME DO PAI" uppercase />
                            <Input label="Nome da Mãe" name="mae" value={formData.mae || ''} onChange={handleChange} placeholder="NOME DA MÃE" uppercase />
                        </div>
                            </div>
                        </div>
                    </div>
                );
            case 1: // Endereço
                return (
                    <div className="space-y-4 animate-fade-in text-gray-900 dark:text-gray-100">
                        <Input label="Endereço" name="endereco" value={formData.endereco || ''} onChange={handleChange} placeholder="RUA, NÚMERO..." uppercase />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Bairro" name="bairro" value={formData.bairro || ''} onChange={handleChange} placeholder="BAIRRO" uppercase />
                            <Input label="Complemento" name="complemento" value={formData.complemento || ''} onChange={handleChange} placeholder="APTO, BLOCO..." uppercase />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="CEP" name="cep" value={formData.cep || ''} onChange={handleChange} placeholder="00000-000" />
                            <Input label="Naturalidade" name="naturalidade" value={formData.naturalidade || ''} onChange={handleChange} placeholder="CIDADE" uppercase />
                            <Select label="UF Naturalidade" name="naturalidadeUF" value={formData.naturalidadeUF || ''} onChange={handleChange}>
                                <option value="" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Selecione</option>
                                {UF_LIST.map(uf => <option key={uf} value={uf} className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>{uf}</option>)}
                            </Select>
                        </div>
                    </div>
                );
            case 2: // Contato
                return (
                    <div className="space-y-4 animate-fade-in text-gray-900 dark:text-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Celular" name="celular" value={formData.celular || ''} onChange={handleChange} placeholder="(92) 90000-0000" />
                            <Input label="Telefone Fixo" name="telefone" value={formData.telefone || ''} onChange={handleChange} placeholder="(92) 3000-0000" />
                        </div>
                        <Input label="Rede Social / Email" name="redeSocial" value={formData.redeSocial || ''} onChange={handleChange} placeholder="@perfil ou email" />
                    </div>
                );
            case 3: // Profissional
                return (
                    <div className="space-y-4 animate-fade-in text-gray-900 dark:text-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4">
                                <Input label="CNPJ" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} placeholder="00.000.000/0000-00" maxLength={18} />
                            </div>
                            <div className="md:col-span-8">
                                <Select
                                    label="Empresa (Nome Fantasia)"
                                    name="codEmpresa"
                                    value={formData.codEmpresa || ''}
                                    onChange={handleEmpresaSelect}
                                >
                                    <option value="" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Selecione uma empresa...</option>
                                    {empresas.map(emp => (
                                        <option key={emp.id} value={emp.id} className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                                            {emp.nomeFantasia || emp.razaoSocial || `CNPJ: ${emp.cnpj}` || 'Empresa sem nome'}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Matrícula" name="matricula" value={formData.matricula || ''} onChange={handleChange} placeholder="Nº MATRÍCULA" />
                            <Input label="Data Admissão" name="dataAdmissao" type="date" value={formData.dataAdmissao || ''} onChange={handleChange} />
                            <Input label="Função" name="funcao" value={formData.funcao || ''} onChange={handleChange} placeholder="CARGO" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Valor Mensalidade" name="valorMensalidade" type="number" value={formData.valorMensalidade?.toString() || ''} onChange={handleChange} placeholder="0.00" />
                            <Input label="CTPS" name="ctps" value={formData.ctps || ''} onChange={handleChange} placeholder="Nº CARTEIRA TRABALHO" />
                        </div>
                        <div className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="carta" checked={!!formData.carta} onChange={handleChange} className="w-4 h-4 text-purple-600 rounded bg-gray-900" />
                                <span className="text-sm font-medium">CARTA</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="carteira" checked={!!formData.carteira} onChange={handleChange} className="w-4 h-4 text-purple-600 rounded" />
                                <span className="text-sm font-medium">CARTEIRA</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="ficha" checked={!!formData.ficha} onChange={handleChange} className="w-4 h-4 text-purple-600 rounded" />
                                <span className="text-sm font-medium">FICHA</span>
                            </label>
                        </div>
                        <Textarea label="Observações" name="observacao" value={formData.observacao || ''} onChange={handleChange} rows={3} placeholder="Notas adicionais..." />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={socio ? 'EDIÇÃO' : 'CADASTRO'}
            maxWidth="max-w-5xl"
        >
            <div className="flex flex-col h-full bg-white dark:bg-gray-900">
                {/* Stepper */}
                <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === index;
                            const isCompleted = currentStep > index;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-purple-600 text-white shadow-lg ring-4 ring-purple-100 dark:ring-purple-900/30' :
                                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {cameraOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                        >
                            <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl">
                                <div className="h-14 px-4 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-800 text-white">
                                    <div className="font-bold uppercase tracking-widest text-sm">Câmera</div>
                                    <button type="button" onClick={closeCamera} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-4">
                                    {cameraError && <div className="text-sm text-red-600 mb-3">{cameraError}</div>}
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                                        <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                                        <div className="absolute inset-0 pointer-events-none ring-1 ring-white/20" />
                                    </div>
                                    <canvas ref={canvasRef} className="hidden" />
                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <Button variant="secondary" onClick={closeCamera}>
                                            Cancelar
                                        </Button>
                                        <Button onClick={capturePhoto} className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900">
                                            Capturar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        CANCELAR
                    </Button>

                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <Button variant="secondary" onClick={handleBack} icon={<ChevronLeft className="w-4 h-4" />}>
                                ANTERIOR
                            </Button>
                        )}

                        {currentStep < steps.length - 1 ? (
                            <Button onClick={handleNext} className="bg-purple-600" icon={<ChevronRight className="w-4 h-4" />}>
                                PRÓXIMO
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                loading={loading}
                                className="bg-green-600 hover:bg-green-700"
                                icon={<Save className="w-4 h-4" />}
                            >
                                {socio ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
