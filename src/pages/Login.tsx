import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getUserEmailByUsername } from '@/lib/services/usuarioService';
import { motion } from 'framer-motion';
import { Lock, User, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let emailToUse = identifier.trim();

      // Check if input is an email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse);

      if (!isEmail) {
        // If not email, assume it's a username and lookup the email
        console.log(`Looking up email for username: ${emailToUse}`);
        const fetchedEmail = await getUserEmailByUsername(emailToUse);
        
        if (!fetchedEmail) {
          console.warn(`Username '${emailToUse}' not found in Usuarios table.`);
          toast.error('Usuário não encontrado.');
          setLoading(false);
          return;
        }
        console.log(`Resolved username '${emailToUse}' to email '${fetchedEmail}'`);
        emailToUse = fetchedEmail;
      }

      console.log(`Attempting login with email: ${emailToUse}`);
      
      // Use Custom RPC Login instead of Supabase Auth
      const { data, error } = await supabase.schema('SINDPLAST').rpc('custom_login', {
        p_email: emailToUse,
        p_password: password
      });

      if (error) {
        console.error('Login RPC Error:', JSON.stringify(error, null, 2));
        const msg =
          (error as any)?.message ||
          (error as any)?.hint ||
          'Erro no servidor ao tentar login.';
        toast.error(msg);
      } else {
        const userRow = Array.isArray(data) ? data[0] : data;
        if (!userRow) {
          toast.error('Credenciais inválidas. Verifique usuário e senha.');
        } else {
          console.log('Login successful via Custom Auth');
          login(userRow); // Save to AuthContext
          toast.success('Login realizado com sucesso!');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao tentar fazer login.');
      console.error('Login exception:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg overflow-hidden p-2"
          >
            <img src="/images/SINDPLAST.png" alt="SINDPLAST Logo" className="w-full h-full object-contain" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
          <p className="text-red-100">Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-red-100 ml-1">Usuário ou Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-200 group-focus-within:text-white transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  const v = e.target.value;
                  setIdentifier(v.includes('@') ? v : v.toUpperCase());
                }}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-red-200/50 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all uppercase"
                placeholder="Digite seu usuário ou email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-red-100 ml-1">Senha</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-200 group-focus-within:text-white transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-red-200/50 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-900 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Entrar
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
