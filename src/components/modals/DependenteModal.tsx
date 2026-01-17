'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCircle, BadgeCheck, ChevronLeft, ChevronRight, CheckCircle2, Save, Camera, Upload, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Dependente } from '@/lib/types/dependente';
import toast from 'react-hot-toast';
import { createDependente, updateDependente, updateDependenteImage, uploadDependenteImage } from '@/lib/services/dependenteService';
import { getSocios, getSocioById } from '@/lib/services/socioService';
import SearchableSelect from '@/components/ui/SearchableSelect';

interface DependenteModalProps {
    isOpen: boolean;
    onClose: () => void;
    dependente?: Dependente | null;
    onSave: () => void;
}

export default function DependenteModal({
    isOpen,
    onClose,
    dependente,
    onSave,
}: DependenteModalProps) {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Partial<Dependente>>({
        dependente: '',
        nascimento: '',
        parentesco: '',
        carteira: false,
        status: true,
        codSocio: '',
        socio: '', // Nome do sócio, idealmente preenchido ao selecionar codSocio
    });

    const [socios, setSocios] = useState<Array<{ value: string; label: string }>>([]);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const steps = [
        { id: 'vinculo', title: 'Vínculo', icon: Users },
        { id: 'dados', title: 'Dados', icon: UserCircle },
        { id: 'status', title: 'Status', icon: BadgeCheck },
    ];

    useEffect(() => {
        if (!isOpen) return;
        setCurrentStep(0);
        setPhotoFile(null);
        setCapturedBlob(null);
        setCameraOpen(false);
        setCameraError(null);
        (async () => {
            try {
                const res = await getSocios({ page: 1, limit: 1000, search: '', sortBy: 'nome', sortDir: 'asc' });
                const options = (res.data || [])
                    .map((s) => ({ value: String(s.id), label: String(s.nome || '').toUpperCase() }))
                    .filter((o) => o.value && o.label);
                setSocios(options);
            } catch {
                setSocios([]);
            }
        })();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (!formData.codSocio) return;
        const found = socios.find((s) => s.value === String(formData.codSocio));
        if (!found) return;
        if (String(formData.socio || '').trim()) return;
        setFormData((prev) => ({ ...prev, socio: found.label }));
    }, [formData.codSocio, formData.socio, isOpen, socios]);

    useEffect(() => {
        if (!isOpen) return;
        const cod = Number(formData.codSocio || 0);
        if (!cod) return;
        const hasEmpresa = String(formData.empresa || '').trim().length > 0;
        if (hasEmpresa) return;
        (async () => {
            try {
                const socio = await getSocioById(cod);
                const empresaValue = String(socio?.razaoSocial || socio?.nomeFantasia || '').toUpperCase();
                if (empresaValue) {
                    setFormData((prev) => ({ ...prev, empresa: empresaValue }));
                }
            } catch (e) {
                void e;
            }
        })();
    }, [isOpen, formData.codSocio, formData.empresa]);

    useEffect(() => {
        if (!isOpen) return;
        if (dependente) {
            setFormData(dependente);
            setPhotoPreviewUrl(dependente.imagem || null);
        } else {
            setFormData({
                dependente: '',
                nascimento: '',
                parentesco: '',
                carteira: false,
                status: true,
                codSocio: '',
                socio: '',
                flagOrfao: false,
            });
            setPhotoPreviewUrl(null);
        }
    }, [dependente, isOpen]);

    const stopCamera = () => {
        const s = streamRef.current;
        if (s) {
            s.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    };

    const closeCamera = () => {
        stopCamera();
        setCameraOpen(false);
        setCameraError(null);
    };

    useEffect(() => {
        if (!isOpen) closeCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handlePhotoFile = (file: File | null) => {
        setCapturedBlob(null);
        setPhotoFile(file);
        if (!file) {
            setPhotoPreviewUrl(dependente?.imagem || null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPhotoPreviewUrl(url);
    };

    const openCamera = async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraOpen(true);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            setCameraError(message || 'Falha ao acessar câmera');
            setCameraOpen(true);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob((blob) => {
            if (!blob) return;
            setCapturedBlob(blob);
            setPhotoFile(null);
            setPhotoPreviewUrl(URL.createObjectURL(blob));
            closeCamera();
        }, 'image/jpeg', 0.92);
    };

    const handleSubmit = async () => {
        const socioId = String(formData.codSocio || '').trim();
        if (!socioId) {
            toast.error('Selecione o sócio responsável.');
            setCurrentStep(0);
            return;
        }
        if (!String(formData.dependente || '').trim()) {
            toast.error('Informe o nome do dependente.');
            setCurrentStep(1);
            return;
        }
        if (!String(formData.nascimento || '').trim()) {
            toast.error('Informe a data de nascimento.');
            setCurrentStep(1);
            return;
        }
        if (!String(formData.parentesco || '').trim()) {
            toast.error('Informe o parentesco.');
            setCurrentStep(1);
            return;
        }

        setLoading(true);

        try {
            let saved: Dependente;
            if (dependente) {
                saved = await updateDependente(dependente.id, formData);
            } else {
                saved = await createDependente(formData);
            }

            if (photoFile || capturedBlob) {
                try {
                    const fileOrBlob = (photoFile ?? capturedBlob) as Blob;
                    const url = await uploadDependenteImage(saved.id, fileOrBlob);
                    await updateDependenteImage(saved.id, url);
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    toast.error(`Foto não enviada: ${message}`);
                }
            }

            toast.success(dependente ? 'Dependente atualizado!' : 'Dependente cadastrado!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving dependente:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar dependente');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const renderStepContent = () => {
        const stepId = steps[currentStep]?.id;

        if (stepId === 'vinculo') {
            return (
                <div className="space-y-6">
                    <SearchableSelect
                        label="Sócio Responsável"
                        value={formData.codSocio ? String(formData.codSocio) : ''}
                        onValueChange={async (v) => {
                            const found = socios.find((s) => s.value === v);
                            let empresaValue = '';
                            try {
                                const socio = v ? await getSocioById(Number(v)) : null;
                                empresaValue = String(socio?.razaoSocial || socio?.nomeFantasia || '').toUpperCase();
                            } catch (e) {
                                void e;
                            }
                            setFormData((prev) => ({
                                ...prev,
                                codSocio: v ? Number(v) : '',
                                socio: found?.label || '',
                                empresa: v ? empresaValue : '',
                            }));
                        }}
                        options={socios}
                        placeholder={socios.length ? 'Selecione...' : 'Carregando...'}
                        disabled={!socios.length}
                        uppercase
                    />
                </div>
            );
        }

        if (stepId === 'dados') {
            return (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-red-600/20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {photoPreviewUrl ? (
                                <img src={photoPreviewUrl} className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle className="w-14 h-14 text-gray-400" />
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoFile(e.target.files?.[0] || null)}
                        />
                        <div className="w-full grid grid-cols-1 gap-2">
                            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full justify-center">
                                <Upload className="w-4 h-4 mr-2" />
                                Selecionar arquivo
                            </Button>
                            <Button
                                type="button"
                                onClick={openCamera}
                                className="w-full justify-center bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Abrir câmera
                            </Button>
                        </div>
                    </div>

                    <Input
                        label="Nome do Dependente"
                        value={formData.dependente}
                        onChange={(e) => setFormData({ ...formData, dependente: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Data de Nascimento"
                            type="date"
                            value={formData.nascimento ? String(formData.nascimento).split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, nascimento: e.target.value })}
                            required
                        />
                        <Select
                            label="Parentesco"
                            value={formData.parentesco}
                            onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                            options={[
                                { value: '', label: 'SELECIONE...' },
                                { value: 'FILHO(A)', label: 'FILHO(A)' },
                                { value: 'ESPOSO(A)', label: 'ESPOSO(A)' },
                                { value: 'PAI', label: 'PAI' },
                                { value: 'MÃE', label: 'MÃE' },
                                { value: 'OUTROS', label: 'OUTROS' },
                            ]}
                            required
                            uppercase
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!formData.carteira}
                            onChange={(e) => setFormData({ ...formData, carteira: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">POSSUI CARTEIRINHA</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ATIVO</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!formData.flagOrfao}
                            onChange={(e) => setFormData({ ...formData, flagOrfao: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ÓRFÃO</span>
                    </label>
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={dependente ? 'EDIÇÃO' : 'CADASTRO'} maxWidth="max-w-5xl">
            <div className="flex flex-col h-full bg-white dark:bg-gray-900">
                <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === index;
                            const isCompleted = currentStep > index;

                            return (
                                <div
                                    key={step.id}
                                    className="relative z-10 flex flex-col items-center gap-2 cursor-pointer"
                                    onClick={() => setCurrentStep(index)}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            isActive
                                                ? 'bg-purple-600 text-white shadow-lg ring-4 ring-purple-100 dark:ring-purple-900/30'
                                                : isCompleted
                                                  ? 'bg-green-500 text-white'
                                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}
                                    >
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span
                                        className={`text-[10px] uppercase font-bold tracking-wider ${
                                            isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

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

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        CANCELAR
                    </Button>

                    <div className="flex gap-3">
                        {currentStep > 0 ? (
                            <Button variant="secondary" onClick={handleBack} icon={<ChevronLeft className="w-4 h-4" />}>
                                ANTERIOR
                            </Button>
                        ) : null}

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
                                {dependente ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
