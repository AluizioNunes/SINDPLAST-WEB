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
import { createSocio, updateSocio, uploadSocioImage, updateSocioImage, socioCpfExists } from '@/lib/services/socioService';
import { getEmpresas } from '@/lib/services/empresaService';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { getUfOptions, getCitiesByUf } from '@/lib/ibgeLocalidades';

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

const formatCNPJ = (value: string) => {
    const cnpj = value.replace(/\D/g, '');
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
};

const formatCPF = (value: string) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

const isValidCPF = (cpf: string) => {
    const digits = String(cpf || '').replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    const calc = (base: string, factor: number) => {
        let total = 0;
        for (let i = 0; i < base.length; i++) {
            total += Number(base[i]) * (factor - i);
        }
        const mod = total % 11;
        return mod < 2 ? 0 : 11 - mod;
    };

    const d1 = calc(digits.slice(0, 9), 10);
    const d2 = calc(digits.slice(0, 10), 11);
    return digits[9] === String(d1) && digits[10] === String(d2);
};

const formatPhoneBR = (value: string) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 4) return `(${ddd}) ${rest}`;
    if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
};

const formatCepDisplay = (value: string) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5, 8)}`;
};

const formatCepStorage = (value: string) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length !== 8) return String(value || '');
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

const formatCurrencyBRL = (value: string) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    const cents = digits.padStart(3, '0');
    const intPart = cents.slice(0, -2).replace(/^0+/, '') || '0';
    const decPart = cents.slice(-2);
    const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${withThousands},${decPart}`;
};

const parseCurrencyBRL = (value: string) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return null;
    const cents = Number(digits);
    if (Number.isNaN(cents)) return null;
    return cents / 100;
};

const toUpperOrEmpty = (v: unknown) => (v == null ? '' : String(v).toUpperCase());

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
    const [valorMensalidadeText, setValorMensalidadeText] = useState<string>('');
    const [cpfError, setCpfError] = useState<string | null>(null);
    const [cpfChecking, setCpfChecking] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [redeSocialOptions, setRedeSocialOptions] = useState<Array<{ value: string; label: string }>>([
        { value: 'LINKEDIN', label: 'LINKEDIN' },
        { value: 'INSTAGRAM', label: 'INSTAGRAM' },
        { value: 'FACEBOOK', label: 'FACEBOOK' },
        { value: 'TIK TOK', label: 'TIK TOK' },
    ]);
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
        try {
            const stored = localStorage.getItem('sindplast.redeSocialOptions');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    const next = parsed
                        .map((s) => String(s || '').toUpperCase())
                        .filter(Boolean)
                        .map((s) => ({ value: s, label: s }));
                    if (next.length) setRedeSocialOptions(next);
                }
            }
        } catch {
            void 0;
        }

        if (isOpen) {
            fetchEmpresas();
        }
        if (socio) {
            setFormData({
                ...socio,
                nome: socio.nome ? toUpperOrEmpty(socio.nome) : socio.nome,
                rg: socio.rg ? toUpperOrEmpty(socio.rg) : socio.rg,
                emissor: socio.emissor ? toUpperOrEmpty(socio.emissor) : socio.emissor,
                sexo: socio.sexo ? toUpperOrEmpty(socio.sexo) : socio.sexo,
                naturalidade: socio.naturalidade ? toUpperOrEmpty(socio.naturalidade) : socio.naturalidade,
                naturalidadeUF: socio.naturalidadeUF ? toUpperOrEmpty(socio.naturalidadeUF) : socio.naturalidadeUF,
                nacionalidade: socio.nacionalidade ? toUpperOrEmpty(socio.nacionalidade) : socio.nacionalidade,
                estadoCivil: socio.estadoCivil ? toUpperOrEmpty(socio.estadoCivil) : socio.estadoCivil,
                endereco: socio.endereco ? toUpperOrEmpty(socio.endereco) : socio.endereco,
                complemento: socio.complemento ? toUpperOrEmpty(socio.complemento) : socio.complemento,
                bairro: socio.bairro ? toUpperOrEmpty(socio.bairro) : socio.bairro,
                pai: socio.pai ? toUpperOrEmpty(socio.pai) : socio.pai,
                mae: socio.mae ? toUpperOrEmpty(socio.mae) : socio.mae,
                status: socio.status ? toUpperOrEmpty(socio.status) : socio.status,
                matricula: socio.matricula ? toUpperOrEmpty(socio.matricula) : socio.matricula,
                ctps: socio.ctps ? toUpperOrEmpty(socio.ctps) : socio.ctps,
                funcao: socio.funcao ? toUpperOrEmpty(socio.funcao) : socio.funcao,
                codEmpresa: socio.codEmpresa ? toUpperOrEmpty(socio.codEmpresa) : socio.codEmpresa,
                razaoSocial: socio.razaoSocial ? toUpperOrEmpty(socio.razaoSocial) : socio.razaoSocial,
                nomeFantasia: socio.nomeFantasia ? toUpperOrEmpty(socio.nomeFantasia) : socio.nomeFantasia,
                motivoDemissao: socio.motivoDemissao ? toUpperOrEmpty(socio.motivoDemissao) : socio.motivoDemissao,
                observacao: socio.observacao ? toUpperOrEmpty(socio.observacao) : socio.observacao,
                empresa: socio.empresa ? toUpperOrEmpty(socio.empresa) : socio.empresa,
                setor: socio.setor ? toUpperOrEmpty(socio.setor) : socio.setor,
                cpf: socio.cpf ? formatCPF(socio.cpf) : socio.cpf,
                cep: socio.cep ? formatCepDisplay(socio.cep) : socio.cep,
                cidade: socio.cidade ? toUpperOrEmpty(socio.cidade) : socio.cidade,
                uf: socio.uf ? toUpperOrEmpty(socio.uf) : socio.uf,
                telefone: socio.telefone ? formatPhoneBR(socio.telefone) : socio.telefone,
                celular: socio.celular ? formatPhoneBR(socio.celular) : socio.celular,
                email: socio.email ? String(socio.email).toLowerCase() : socio.email,
                cnpj: socio.cnpj ? formatCNPJ(socio.cnpj) : socio.cnpj,
                redeSocial: socio.redeSocial ? toUpperOrEmpty(socio.redeSocial) : socio.redeSocial,
                linkRedeSocial: socio.linkRedeSocial || '',
            });
            setValorMensalidadeText(socio.valorMensalidade != null ? formatCurrencyBRL(String(Math.round(Number(socio.valorMensalidade) * 100))) : '');
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
            setValorMensalidadeText('');
        }
        setCurrentStep(0);
        setPhotoFile(null);
        setCapturedBlob(null);
        setCameraOpen(false);
        setCameraError(null);
        setPhotoPreviewUrl(socio?.imagem || null);
        setCpfError(null);
        setCpfChecking(false);
    }, [socio, isOpen]);

    useEffect(() => {
        const cpfDigits = String(formData.cpf || '').replace(/\D/g, '');
        if (!isOpen) return;
        if (!cpfDigits) {
            setCpfError(null);
            setCpfChecking(false);
            return;
        }
        if (cpfDigits.length < 11) {
            setCpfError(null);
            setCpfChecking(false);
            return;
        }
        if (!isValidCPF(cpfDigits)) {
            setCpfError('CPF inválido');
            setCpfChecking(false);
            return;
        }

        let cancelled = false;
        const t = window.setTimeout(async () => {
            try {
                setCpfChecking(true);
                const exists = await socioCpfExists(cpfDigits, socio?.id);
                if (cancelled) return;
                setCpfError(exists ? 'CPF já cadastrado' : null);
            } catch {
                if (cancelled) return;
                setCpfError(null);
            } finally {
                if (!cancelled) setCpfChecking(false);
            }
        }, 450);
        return () => {
            cancelled = true;
            window.clearTimeout(t);
        };
    }, [formData.cpf, isOpen, socio?.id]);

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
            return;
        }

        if (name === 'cpf') {
            const masked = formatCPF(value);
            setFormData((prev) => ({ ...prev, cpf: masked }));
            return;
        }

        if (name === 'cep') {
            const masked = formatCepDisplay(value);
            setFormData((prev) => ({ ...prev, cep: masked }));

            const digits = masked.replace(/\D/g, '');
            if (digits.length === 8) {
                setCepLoading(true);
                fetch(`https://viacep.com.br/ws/${digits}/json/`)
                    .then((r) => r.json())
                    .then((data) => {
                        if (data?.erro) {
                            toast.error('CEP não encontrado');
                            return;
                        }
                        const logradouro = String(data?.logradouro || '').toUpperCase();
                        const bairro = String(data?.bairro || '').toUpperCase();
                        const cidade = String(data?.localidade || '').toUpperCase();
                        const uf = String(data?.uf || '').toUpperCase();

                        setFormData((prev) => ({
                            ...prev,
                            endereco: logradouro || prev.endereco || '',
                            bairro: bairro || prev.bairro || '',
                            cidade: cidade || prev.cidade || '',
                            uf: uf || prev.uf || '',
                        }));
                    })
                    .catch(() => {
                        toast.error('Erro ao buscar CEP');
                    })
                    .finally(() => setCepLoading(false));
            }
            return;
        }

        if (name === 'telefone' || name === 'celular') {
            const masked = formatPhoneBR(value);
            setFormData((prev) => ({ ...prev, [name]: masked }));
            return;
        }

        if (name === 'email') {
            setFormData((prev) => ({ ...prev, email: String(value || '').toLowerCase() }));
            return;
        } else if (name === 'cnpj') {
            const formattedCNPJ = formatCNPJ(value);
            const cleanCNPJ = formattedCNPJ.replace(/\D/g, '');
            const found = empresas.find(emp => emp.cnpj.replace(/\D/g, '') === cleanCNPJ);

            if (found) {
                setFormData(prev => ({
                    ...prev,
                    cnpj: formattedCNPJ,
                    nomeFantasia: (found.nomeFantasia || '').toUpperCase(),
                    razaoSocial: (found.razaoSocial || '').toUpperCase(),
                    codEmpresa: found.id.toString()
                }));
            } else {
                setFormData(prev => ({ ...prev, cnpj: formattedCNPJ }));
            }
        } else {
            const upperExcept = new Set([
                'nascimento',
                'dataCadastro',
                'dataMensalidade',
                'dataAdmissao',
                'dataDemissao',
                'linkRedeSocial',
            ]);
            const nextValue = upperExcept.has(name) ? value : String(value || '').toUpperCase();
            setFormData(prev => ({ ...prev, [name]: nextValue }));
        }
    };

    const handleEmpresaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const empresaId = e.target.value;
        const found = empresas.find(emp => emp.id.toString() === empresaId);
        if (found) {
            setFormData(prev => ({
                ...prev,
                nomeFantasia: (found.nomeFantasia || '').toUpperCase(),
                razaoSocial: (found.razaoSocial || '').toUpperCase(),
                cnpj: formatCNPJ(found.cnpj || ''),
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
            const cpfDigits = String(formData.cpf || '').replace(/\D/g, '');
            if (cpfDigits) {
                if (cpfDigits.length !== 11 || !isValidCPF(cpfDigits)) {
                    toast.error('CPF inválido');
                    setLoading(false);
                    return;
                }
                const exists = await socioCpfExists(cpfDigits, socio?.id);
                if (exists) {
                    toast.error('CPF já cadastrado');
                    setLoading(false);
                    return;
                }
            }

            const valorMensalidade = parseCurrencyBRL(valorMensalidadeText);
            const payload: Partial<Socio> = {
                ...formData,
                cpf: formData.cpf ? formatCPF(formData.cpf) : formData.cpf,
                cep: formData.cep ? formatCepStorage(formData.cep) : formData.cep,
                telefone: formData.telefone ? formatPhoneBR(formData.telefone) : formData.telefone,
                celular: formData.celular ? formatPhoneBR(formData.celular) : formData.celular,
                email: formData.email ? String(formData.email).toLowerCase() : formData.email,
                valorMensalidade: valorMensalidade ?? null,
            };

            const saved = socio
                ? await updateSocio(socio.id, payload)
                : await createSocio(payload);

            if (photoFile || capturedBlob) {
                try {
                    const fileOrBlob = (photoFile ?? capturedBlob) as Blob;
                    const url = await uploadSocioImage(saved.id, fileOrBlob);
                    await updateSocioImage(saved.id, url);
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    toast.error(`Foto não enviada: ${message}`);
                }
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
                            <Input
                                label="CPF"
                                name="cpf"
                                value={formData.cpf || ''}
                                onChange={handleChange}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                error={cpfError || undefined}
                                helperText={cpfChecking ? 'Verificando CPF...' : undefined}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Data Nascimento" name="nascimento" type="date" value={formData.nascimento || ''} onChange={handleChange} />
                            <Input label="RG" name="rg" value={formData.rg || ''} onChange={handleChange} placeholder="Nº IDENTIDADE" uppercase />
                            <Input label="Órgão Emissor" name="emissor" value={formData.emissor || ''} onChange={handleChange} placeholder="SSP/AM" uppercase />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="UF Naturalidade"
                                name="naturalidadeUF"
                                value={formData.naturalidadeUF || ''}
                                onChange={(e) => {
                                    const nextUf = String(e.target.value || '').toUpperCase();
                                    setFormData((p) => ({ ...p, naturalidadeUF: nextUf, naturalidade: '' }));
                                }}
                                options={[{ value: '', label: 'SELECIONE' }, ...getUfOptions()]}
                                uppercase
                            />
                            <SearchableSelect
                                label="Naturalidade"
                                value={formData.naturalidade || ''}
                                onValueChange={(v) => setFormData((p) => ({ ...p, naturalidade: String(v || '').toUpperCase() }))}
                                options={getCitiesByUf(formData.naturalidadeUF || '')}
                                placeholder={formData.naturalidadeUF ? 'Selecione...' : 'Selecione UF primeiro'}
                                disabled={!formData.naturalidadeUF}
                                uppercase
                            />
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
                            <Input
                                label="CEP"
                                name="cep"
                                value={formData.cep || ''}
                                onChange={handleChange}
                                placeholder="00.000-000"
                                maxLength={10}
                                helperText={cepLoading ? 'Buscando CEP...' : undefined}
                            />
                            <SearchableSelect
                                label="Cidade"
                                value={formData.cidade || ''}
                                onValueChange={(v) => setFormData((p) => ({ ...p, cidade: String(v || '').toUpperCase() }))}
                                options={getCitiesByUf(formData.uf || '')}
                                placeholder={formData.uf ? 'Selecione...' : 'Selecione UF primeiro'}
                                disabled={!formData.uf}
                                uppercase
                            />
                            <Select
                                label="UF"
                                name="uf"
                                value={formData.uf || ''}
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
            case 2: // Contato
                return (
                    <div className="space-y-4 animate-fade-in text-gray-900 dark:text-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Telefone" name="telefone" value={formData.telefone || ''} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} />
                            <Input label="Celular" name="celular" value={formData.celular || ''} onChange={handleChange} placeholder="(00) 00000-0000" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                placeholder="email@dominio.com"
                                className="lowercase"
                            />
                            <SearchableSelect
                                label="Rede Social"
                                value={formData.redeSocial || ''}
                                onValueChange={(v) => setFormData((p) => ({ ...p, redeSocial: String(v || '').toUpperCase() }))}
                                options={redeSocialOptions}
                                placeholder="Selecione..."
                                allowCreate
                                uppercase
                                onCreateOption={(v) => {
                                    const next = String(v || '').toUpperCase();
                                    if (!next) return;
                                    setRedeSocialOptions((prev) => {
                                        const merged = [...prev, { value: next, label: next }].filter(Boolean);
                                        const uniq = Array.from(new Map(merged.map((o) => [o.value, o])).values()).sort((a, b) => a.label.localeCompare(b.label));
                                        try {
                                            localStorage.setItem('sindplast.redeSocialOptions', JSON.stringify(uniq.map((o) => o.value)));
                                        } catch {
                                            void 0;
                                        }
                                        return uniq;
                                    });
                                }}
                            />
                        </div>
                        <Input
                            label="Link Rede Social"
                            name="linkRedeSocial"
                            value={formData.linkRedeSocial || ''}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
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
                            <Input label="Matrícula" name="matricula" value={formData.matricula || ''} onChange={handleChange} placeholder="Nº MATRÍCULA" uppercase />
                            <Input label="Data Admissão" name="dataAdmissao" type="date" value={formData.dataAdmissao || ''} onChange={handleChange} />
                            <Input label="Função" name="funcao" value={formData.funcao || ''} onChange={handleChange} placeholder="CARGO" uppercase />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Valor da Mensalidade"
                                name="valorMensalidade"
                                value={valorMensalidadeText}
                                onChange={(e) => setValorMensalidadeText(formatCurrencyBRL(e.target.value))}
                                placeholder="R$ 0,00"
                            />
                            <Input label="CTPS" name="ctps" value={formData.ctps || ''} onChange={handleChange} placeholder="Nº CARTEIRA TRABALHO" uppercase />
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
                                <div
                                    key={step.id}
                                    className="relative z-10 flex flex-col items-center gap-2 cursor-pointer"
                                    onClick={() => setCurrentStep(index)}
                                >
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
