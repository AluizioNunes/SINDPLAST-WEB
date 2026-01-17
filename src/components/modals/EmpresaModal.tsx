'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Phone, BadgeDollarSign, ChevronLeft, ChevronRight, CheckCircle2, Save, Camera, Upload, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Empresa } from '@/lib/types/empresa';
import toast from 'react-hot-toast';
import { createEmpresa, updateEmpresa, updateEmpresaImage, uploadEmpresaImage } from '@/lib/services/empresaService';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { getUfOptions, getCitiesByUf } from '@/lib/ibgeLocalidades';

interface EmpresaModalProps {
    isOpen: boolean;
    onClose: () => void;
    empresa?: Empresa | null;
    onSave: () => void;
}

export default function EmpresaModal({
    isOpen,
    onClose,
    empresa,
    onSave,
}: EmpresaModalProps) {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [formData, setFormData] = useState<Partial<Empresa>>({
        codEmpresa: '',
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: '',
        uf: '',
        telefone01: '',
        telefone02: '',
        fax: '',
        celular: '',
        whatsapp: '',
        instagram: '',
        linkedin: '',
        nFuncionarios: 0,
        dataContribuicao: '',
        valorContribuicao: 0,
        observacao: '',
    });

    const steps = [
        { id: 'empresa', title: 'Empresa', icon: Building2 },
        { id: 'endereco', title: 'Endereço', icon: MapPin },
        { id: 'contato', title: 'Contato', icon: Phone },
        { id: 'contribuicao', title: 'Contribuição', icon: BadgeDollarSign },
    ];

    useEffect(() => {
        if (!isOpen) return;
        setCurrentStep(0);
        setPhotoFile(null);
        setCapturedBlob(null);
        setCameraOpen(false);
        setCameraError(null);
        if (empresa) {
            setFormData(empresa);
            setPhotoPreviewUrl(empresa.imagem || null);
        } else {
            setFormData({
                codEmpresa: '',
                cnpj: '',
                razaoSocial: '',
                nomeFantasia: '',
                endereco: '',
                numero: '',
                complemento: '',
                bairro: '',
                cep: '',
                cidade: '',
                uf: '',
                telefone01: '',
                telefone02: '',
                fax: '',
                celular: '',
                whatsapp: '',
                instagram: '',
                linkedin: '',
                nFuncionarios: 0,
                dataContribuicao: '',
                valorContribuicao: 0,
                observacao: '',
            });
            setPhotoPreviewUrl(null);
        }
    }, [empresa, isOpen]);

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
            setPhotoPreviewUrl(empresa?.imagem || null);
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
        const cnpj = String(formData.cnpj || '').trim();
        const razaoSocial = String(formData.razaoSocial || '').trim();
        if (!cnpj || !razaoSocial) {
            toast.error('Preencha CNPJ e Razão Social.');
            setCurrentStep(0);
            return;
        }

        setLoading(true);

        try {
            let saved: Empresa;
            if (empresa) {
                saved = await updateEmpresa(empresa.id, formData);
            } else {
                saved = await createEmpresa(formData);
            }

            if (photoFile || capturedBlob) {
                try {
                    const fileOrBlob = (photoFile ?? capturedBlob) as Blob;
                    const url = await uploadEmpresaImage(saved.id, fileOrBlob);
                    await updateEmpresaImage(saved.id, url);
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    toast.error(`Foto não enviada: ${message}`);
                }
            }

            toast.success(empresa ? 'Empresa atualizada!' : 'Empresa cadastrada!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving empresa:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar empresa');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const renderStepContent = () => {
        const stepId = steps[currentStep]?.id;

        if (stepId === 'empresa') {
            return (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-red-600/20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {photoPreviewUrl ? (
                                <img src={photoPreviewUrl} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-14 h-14 text-gray-400" />
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
                            label="Código da Empresa"
                            value={formData.codEmpresa}
                            onChange={(e) => setFormData({ ...formData, codEmpresa: e.target.value })}
                        />
                        <Input
                            label="CNPJ"
                            value={formData.cnpj}
                            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Razão Social"
                            value={formData.razaoSocial}
                            onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                            required
                        />
                        <Input
                            label="Nome Fantasia"
                            value={formData.nomeFantasia}
                            onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                        />
                    </div>
                </div>
            );
        }

        if (stepId === 'endereco') {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                label="Endereço"
                                value={formData.endereco}
                                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Número"
                            value={formData.numero}
                            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Complemento"
                            value={formData.complemento}
                            onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                        />
                        <Input
                            label="Bairro"
                            value={formData.bairro}
                            onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                        />
                        <Input
                            label="CEP"
                            value={formData.cep}
                            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SearchableSelect
                            label="Cidade"
                            value={formData.cidade}
                            onValueChange={(v) => setFormData((p) => ({ ...p, cidade: String(v || '').toUpperCase() }))}
                            options={getCitiesByUf(formData.uf)}
                            placeholder={formData.uf ? 'Selecione...' : 'Selecione UF primeiro'}
                            disabled={!formData.uf}
                            uppercase
                        />
                        <Select
                            label="UF"
                            value={formData.uf}
                            onChange={(e) => {
                                const nextUf = String(e.target.value || '').toUpperCase();
                                setFormData((p) => ({ ...p, uf: nextUf, cidade: '' }));
                            }}
                            options={[{ value: '', label: 'SELECIONE' }, ...getUfOptions()]}
                            uppercase
                        />
                    </div>
                </div>
            );
        }

        if (stepId === 'contato') {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Telefone 1"
                            value={formData.telefone01}
                            onChange={(e) => setFormData({ ...formData, telefone01: e.target.value })}
                        />
                        <Input
                            label="Telefone 2"
                            value={formData.telefone02}
                            onChange={(e) => setFormData({ ...formData, telefone02: e.target.value })}
                        />
                        <Input
                            label="Celular"
                            value={formData.celular}
                            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="WhatsApp"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        />
                        <Input
                            label="Instagram"
                            value={formData.instagram}
                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        />
                        <Input
                            label="LinkedIn"
                            value={formData.linkedin}
                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Nº Funcionários"
                        type="number"
                        value={formData.nFuncionarios}
                        onChange={(e) => setFormData({ ...formData, nFuncionarios: Number(e.target.value) })}
                    />
                    <Input
                        label="Data Contribuição"
                        type="date"
                        value={formData.dataContribuicao}
                        onChange={(e) => setFormData({ ...formData, dataContribuicao: e.target.value })}
                    />
                    <Input
                        label="Valor Contribuição"
                        type="number"
                        step="0.01"
                        value={formData.valorContribuicao}
                        onChange={(e) => setFormData({ ...formData, valorContribuicao: Number(e.target.value) })}
                    />
                </div>

                <Textarea
                    label="Observações"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                />
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={empresa ? 'EDIÇÃO' : 'CADASTRO'} maxWidth="max-w-5xl">
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
                                {empresa ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
