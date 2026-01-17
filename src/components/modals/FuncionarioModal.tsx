'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Camera, ChevronLeft, ChevronRight, CheckCircle2, MapPin, Save, Upload, User, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Funcionario } from '@/lib/types/funcionario';
import toast from 'react-hot-toast';
import { createFuncionario, updateFuncionario, updateFuncionarioImage, uploadFuncionarioImage } from '@/lib/services/funcionarioService';
import { getEmpresas } from '@/lib/services/empresaService';
import SearchableSelect from '@/components/ui/SearchableSelect';

interface FuncionarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    funcionario?: Funcionario | null;
    onSave: () => void;
}

export default function FuncionarioModal({
    isOpen,
    onClose,
    funcionario,
    onSave,
}: FuncionarioModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [empresas, setEmpresas] = useState<Array<{ value: string; label: string }>>([]);
    const [formData, setFormData] = useState<Partial<Funcionario>>({
        nome: '',
        cpf: '',
        cargo: '',
        dataAdmissao: '',
        salario: 0,
        empresaId: 0,
        empresaLocal: '',
        depto: '',
        setor: '',
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

    const steps = [
        { id: 'pessoal', title: 'Pessoal', icon: User },
        { id: 'profissional', title: 'Profissional', icon: Briefcase },
        { id: 'local', title: 'Local', icon: MapPin },
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
                const res = await getEmpresas({ page: 1, limit: 1000, search: '' });
                const options = (res.data || []).map((e) => ({
                    value: String(e.id),
                    label: String(e.nomeFantasia || e.razaoSocial || '').toUpperCase(),
                }));
                setEmpresas(options.filter((o) => o.value && o.label));
            } catch {
                setEmpresas([]);
            }
        })();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (funcionario) {
            setFormData(funcionario);
            setPhotoPreviewUrl(funcionario.imagem || null);
        } else {
            setFormData({
                nome: '',
                cpf: '',
                cargo: '',
                dataAdmissao: '',
                salario: 0,
                empresaId: 0,
                empresaLocal: '',
                depto: '',
                setor: '',
            });
            setPhotoPreviewUrl(null);
        }
    }, [funcionario, isOpen]);

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
            setPhotoPreviewUrl(funcionario?.imagem || null);
            return;
        }
        setPhotoPreviewUrl(URL.createObjectURL(file));
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

    const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const handleSubmit = async () => {
        if (!String(formData.nome || '').trim()) {
            toast.error('Informe o nome.');
            setCurrentStep(0);
            return;
        }

        setLoading(true);

        try {
            let saved: Funcionario;
            if (funcionario) {
                saved = await updateFuncionario(funcionario.id, formData);
            } else {
                saved = await createFuncionario(formData);
            }

            if (photoFile || capturedBlob) {
                try {
                    const fileOrBlob = (photoFile ?? capturedBlob) as Blob;
                    const url = await uploadFuncionarioImage(saved.id, fileOrBlob);
                    await updateFuncionarioImage(saved.id, url);
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    toast.error(`Foto não enviada: ${message}`);
                }
            }

            toast.success(funcionario ? 'Funcionário atualizado!' : 'Funcionário cadastrado!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving funcionario:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar funcionário');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        const stepId = steps[currentStep]?.id;

        if (stepId === 'pessoal') {
            return (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-red-600/20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {photoPreviewUrl ? (
                                <img src={photoPreviewUrl} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-14 h-14 text-gray-400" />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome Completo"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                        <Input
                            label="CPF"
                            value={formData.cpf}
                            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                            placeholder="000.000.000-00"
                        />
                    </div>
                </div>
            );
        }

        if (stepId === 'profissional') {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Cargo"
                            value={formData.cargo || ''}
                            onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        />
                        <Input
                            label="CBO"
                            value={formData.cbo || ''}
                            onChange={(e) => setFormData({ ...formData, cbo: e.target.value })}
                        />
                        <Input
                            label="Data de Admissão"
                            type="date"
                            value={formData.dataAdmissao ? String(formData.dataAdmissao).split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Salário"
                            type="number"
                            step="0.01"
                            value={formData.salario ?? 0}
                            onChange={(e) => setFormData({ ...formData, salario: Number(e.target.value) })}
                        />
                        <Input
                            label="Departamento"
                            value={formData.depto || ''}
                            onChange={(e) => setFormData({ ...formData, depto: e.target.value })}
                        />
                        <Input
                            label="Setor"
                            value={formData.setor || ''}
                            onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Empresa (Local)"
                        value={formData.empresaLocal || ''}
                        onChange={(e) => setFormData({ ...formData, empresaLocal: e.target.value })}
                        placeholder="Nome do local de trabalho"
                    />
                    <SearchableSelect
                        label="Empresa Vinculada"
                        value={formData.empresaId ? String(formData.empresaId) : ''}
                        onValueChange={(v) => setFormData({ ...formData, empresaId: v ? Number(v) : 0 })}
                        options={empresas}
                        placeholder={empresas.length ? 'Selecione...' : 'Carregando...'}
                        disabled={!empresas.length}
                        uppercase
                    />
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={funcionario ? 'EDIÇÃO' : 'CADASTRO'} maxWidth="max-w-5xl">
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
                                {funcionario ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
