'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Usuario } from '@/lib/types/usuario';
import toast from 'react-hot-toast';
import { createUsuario, updateUsuario, updateUsuarioImage, uploadUsuarioImage } from '@/lib/services/usuarioService';
import { getPerfis } from '@/lib/services/perfilService';
import { Camera, CheckCircle2, ChevronLeft, ChevronRight, Eye, EyeOff, Save, Upload, UserPlus, UserCircle, Users, X } from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { getFuncionarios } from '@/lib/services/funcionarioService';
import { Funcionario } from '@/lib/types/funcionario';

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario?: Usuario | null;
    onSave: () => void;
}

export default function UsuarioModal({
    isOpen,
    onClose,
    usuario,
    onSave,
}: UsuarioModalProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [linkToFuncionario, setLinkToFuncionario] = useState(false);
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string>('');
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [useFuncionarioPhoto, setUseFuncionarioPhoto] = useState(false);
    const [removePhoto, setRemovePhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    // Campos opcionais como Senha não estão no tipo base Usuario, mas são necessários no form
    const [formData, setFormData] = useState<Partial<Usuario> & { Senha?: string }>({
        Nome: '',
        CPF: '',
        Funcao: '',
        Email: '',
        Usuario: '',
        Perfil: '',
        Cadastrante: 'SISTEMA', // Default ou pego da sessão
    });

    const { data: perfis, isLoading: isLoadingPerfis, isError: isErrorPerfis } = useQuery({
        queryKey: ['perfis'],
        queryFn: getPerfis,
    });

    const perfilOptions = perfis?.map(p => ({
        value: p.Perfil,
        label: p.Perfil?.toUpperCase?.() ?? p.Perfil
    })) || [];

    const funcionarioOptions = useMemo(() => {
        return (funcionarios || []).map((f) => ({
            value: String(f.id),
            label: `${String(f.nome || '').toUpperCase()}${f.cpf ? ` - ${f.cpf}` : ''}`,
        }));
    }, [funcionarios]);

    useEffect(() => {
        if (!isOpen) return;
        setCurrentStep(0);
        setShowPassword(false);
        setPhotoFile(null);
        setCapturedBlob(null);
        setCameraOpen(false);
        setCameraError(null);
        setUseFuncionarioPhoto(false);
        setRemovePhoto(false);
        if (usuario) {
            setFormData(usuario);
            setLinkToFuncionario(false);
            setSelectedFuncionarioId('');
            setPhotoPreviewUrl(usuario.Imagem || null);
        } else {
            setFormData({
                Nome: '',
                CPF: '',
                Funcao: '',
                Email: '',
                Usuario: '',
                Perfil: '',
                Cadastrante: 'SISTEMA',
            });
            setLinkToFuncionario(false);
            setSelectedFuncionarioId('');
            setPhotoPreviewUrl(null);
        }
    }, [usuario, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const res = await getFuncionarios({ page: 1, limit: 1000, search: '', sortBy: 'nome', sortDir: 'asc' });
                setFuncionarios(res.data || []);
            } catch {
                setFuncionarios([]);
            }
        })();
    }, [isOpen]);

    useEffect(() => {
        if (isErrorPerfis) {
            toast.error('Erro ao carregar perfis de acesso');
        }
    }, [isErrorPerfis]);

    const selectedFuncionario = useMemo(() => {
        if (!selectedFuncionarioId) return null;
        return funcionarios.find((f) => String(f.id) === String(selectedFuncionarioId)) || null;
    }, [funcionarios, selectedFuncionarioId]);

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
        setRemovePhoto(false);
        setUseFuncionarioPhoto(false);
        setCapturedBlob(null);
        setPhotoFile(file);
        if (!file) {
            setPhotoPreviewUrl(usuario?.Imagem || null);
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
            setRemovePhoto(false);
            setUseFuncionarioPhoto(false);
            setCapturedBlob(blob);
            setPhotoFile(null);
            setPhotoPreviewUrl(URL.createObjectURL(blob));
            closeCamera();
        }, 'image/jpeg', 0.92);
    };

    const clearPhoto = () => {
        setRemovePhoto(true);
        setUseFuncionarioPhoto(false);
        setPhotoFile(null);
        setCapturedBlob(null);
        setPhotoPreviewUrl(null);
    };

    const applyFuncionarioToForm = (id: string) => {
        const f = funcionarios.find((x) => String(x.id) === String(id));
        if (!f) return;

        const nome = String(f.nome || '').toUpperCase();
        const cpf = String(f.cpf || '');
        const funcao = String(f.cargo || '').toUpperCase();

        setFormData((prev) => {
            const next: any = { ...prev };
            if (!String(next.Nome || '').trim()) next.Nome = nome;
            if (!String(next.CPF || '').trim()) next.CPF = cpf;
            if (!String(next.Funcao || '').trim()) next.Funcao = funcao;
            return next;
        });
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 11) value = value.slice(0, 11);

        // Apply mask
        let maskedValue = value;
        if (value.length > 9) {
            maskedValue = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
        } else if (value.length > 6) {
            maskedValue = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
        } else if (value.length > 3) {
            maskedValue = `${value.slice(0, 3)}.${value.slice(3)}`;
        }

        setFormData({ ...formData, CPF: maskedValue });
    };

    const validateCPF = (cpf: string) => {
        if (!cpf) return true; // Optional field
        const cleanCPF = cpf.replace(/\D/g, '');
        if (cleanCPF.length !== 11) return false;
        
        // Basic CPF validation logic (checking for repeated digits)
        if (/^(\d)\1+$/.test(cleanCPF)) return false;
        
        // Additional checksum validation could be added here if needed
        return true;
    };

    const steps = [
        { id: 'dados', title: 'Dados', icon: Users },
        { id: 'acesso', title: 'Acesso', icon: UserPlus },
    ];

    const handleSubmit = async () => {
        
        if (formData.CPF && !validateCPF(formData.CPF)) {
            toast.error('CPF inválido');
            setCurrentStep(0);
            return;
        }

        setLoading(true);

        try {
            // Remover Senha se estiver vazia na edição
            const dataToSubmit = { ...formData };
            if (dataToSubmit.Nome) dataToSubmit.Nome = dataToSubmit.Nome.toUpperCase();
            if (dataToSubmit.Funcao) dataToSubmit.Funcao = dataToSubmit.Funcao.toUpperCase();
            if (dataToSubmit.Usuario) dataToSubmit.Usuario = dataToSubmit.Usuario.toUpperCase();
            if (dataToSubmit.Cadastrante) dataToSubmit.Cadastrante = dataToSubmit.Cadastrante.toUpperCase();
            if (dataToSubmit.Email) dataToSubmit.Email = dataToSubmit.Email.toLowerCase();
            if (usuario) {
                // Em edição: se senha não foi alterada (campo vazio), não enviar
                if (!dataToSubmit.Senha || dataToSubmit.Senha.trim() === '') {
                    delete dataToSubmit.Senha;
                }
            }

            const saved = usuario
                ? await updateUsuario(usuario.IdUsuarios, dataToSubmit)
                : await createUsuario(dataToSubmit as any);

            if (removePhoto) {
                try {
                    await updateUsuarioImage(saved.IdUsuarios, null);
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    toast.error(`Foto não removida: ${message}`);
                }
            } else if (useFuncionarioPhoto && selectedFuncionario?.imagem) {
                try {
                    await updateUsuarioImage(saved.IdUsuarios, String(selectedFuncionario.imagem));
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    toast.error(`Foto não aplicada: ${message}`);
                }
            } else if (photoFile || capturedBlob) {
                try {
                    const fileOrBlob = (photoFile ?? capturedBlob) as Blob;
                    const url = await uploadUsuarioImage(saved.IdUsuarios, fileOrBlob);
                    await updateUsuarioImage(saved.IdUsuarios, url);
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    toast.error(`Foto não enviada: ${message}`);
                }
            }

            toast.success(usuario ? 'Usuário atualizado!' : 'Usuário cadastrado!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving usuario:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const renderStepContent = () => {
        const stepId = steps[currentStep]?.id;

        if (stepId === 'dados') {
            return (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Foto</div>
                            {photoPreviewUrl ? (
                                <button
                                    type="button"
                                    onClick={clearPhoto}
                                    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                                    title="Remover"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) : null}
                        </div>

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

                            {linkToFuncionario && selectedFuncionario?.imagem ? (
                                <label className="w-full flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useFuncionarioPhoto}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setUseFuncionarioPhoto(checked);
                                            setRemovePhoto(false);
                                            setPhotoFile(null);
                                            setCapturedBlob(null);
                                            setPhotoPreviewUrl(checked ? String(selectedFuncionario.imagem) : (usuario?.Imagem || null));
                                        }}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                                        Usar foto do funcionário já cadastrada
                                    </span>
                                </label>
                            ) : null}

                            <div className="w-full grid grid-cols-1 gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setUseFuncionarioPhoto(false);
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full justify-center"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Selecionar arquivo
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setUseFuncionarioPhoto(false);
                                        openCamera();
                                    }}
                                    className="w-full justify-center bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Abrir câmera
                                </Button>
                            </div>
                        </div>
                    </div>

                    {!usuario ? (
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={linkToFuncionario}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setLinkToFuncionario(checked);
                                        if (!checked) setSelectedFuncionarioId('');
                                    }}
                                    className="w-4 h-4 text-purple-600 rounded"
                                />
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 uppercase">
                                    Criar acesso para um funcionário
                                </span>
                            </label>

                            {linkToFuncionario ? (
                                <div className="mt-4">
                                    <SearchableSelect
                                        label="Funcionário"
                                        value={selectedFuncionarioId}
                                        onValueChange={(v) => {
                                            setSelectedFuncionarioId(v || '');
                                            if (v) applyFuncionarioToForm(v);
                                            setUseFuncionarioPhoto(false);
                                        }}
                                        options={funcionarioOptions}
                                        placeholder={funcionarioOptions.length ? 'Selecione...' : 'Carregando...'}
                                        disabled={!funcionarioOptions.length}
                                        uppercase
                                    />
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome Completo"
                            value={formData.Nome}
                            onChange={(e) => setFormData({ ...formData, Nome: e.target.value.toUpperCase() })}
                            uppercase
                            required
                        />
                        <Input
                            label="CPF"
                            value={formData.CPF}
                            onChange={handleCPFChange}
                            placeholder="000.000.000-00"
                            maxLength={14}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email"
                            type="email"
                            value={formData.Email}
                            onChange={(e) => setFormData({ ...formData, Email: e.target.value.toLowerCase() })}
                            className="lowercase"
                            required
                        />
                        <Input
                            label="Função"
                            value={formData.Funcao}
                            onChange={(e) => setFormData({ ...formData, Funcao: e.target.value.toUpperCase() })}
                            uppercase
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Usuário (Login)"
                        value={formData.Usuario}
                        onChange={(e) => setFormData({ ...formData, Usuario: e.target.value.toUpperCase() })}
                        uppercase
                        required
                    />

                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            {usuario ? "Nova Senha (opcional)" : "Senha"}
                            {!usuario && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.Senha || ''}
                                onChange={(e) => setFormData({ ...formData, Senha: e.target.value })}
                                required={!usuario}
                                className="block w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all border-gray-300 dark:border-gray-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <Select
                    label="Perfil de Acesso"
                    value={formData.Perfil}
                    onChange={(e) => setFormData({ ...formData, Perfil: e.target.value })}
                    options={[
                        ...(isLoadingPerfis
                            ? [{ value: '', label: 'CARREGANDO...' }]
                            : [{ value: '', label: 'SELECIONE...' }]),
                        ...perfilOptions,
                    ]}
                    uppercase
                    required
                />
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={usuario ? 'EDIÇÃO' : 'CADASTRO'} maxWidth="max-w-5xl">
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
                                {usuario ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
