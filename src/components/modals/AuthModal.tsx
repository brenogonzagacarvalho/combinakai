'use client';

import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  Lock,
  Mail,
  LogOut,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isFirebaseReady, signInWithGoogle, signInEmail, signUpEmail, logout } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao autenticar com o Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.code === 'auth/invalid-credential'
          ? 'E-mail ou senha incorretos.'
          : err.code === 'auth/email-already-in-use'
          ? 'Este e-mail já está cadastrado.'
          : err.message || 'Erro ao realizar login.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBF9F5] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#EAE5DC]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5DC] bg-white/70">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-[#C29F68]" />
            <h2 className="font-serif font-bold text-base text-[#111110]">
              {user ? 'Minha Conta na Nuvem' : 'Sincronizar com Firebase'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#6E6B65] flex items-center justify-center active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 no-scrollbar">
          {/* USER LOGGED IN STATE */}
          {user ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-[#18181B] text-[#E5C799] mx-auto flex items-center justify-center font-bold text-xl shadow-md border-2 border-[#C29F68]">
                {user.email ? user.email[0].toUpperCase() : '👤'}
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#111110]">
                  Armário Sincronizado
                </h3>
                <p className="text-xs text-[#78756E] mt-0.5">{user.email || 'Conta Conectada'}</p>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EAE5DC] text-xs text-[#2F855A] flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                <span className="font-medium">Suas roupas e looks estão salvos no Firebase Cloud.</span>
              </div>

              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-white border border-[#E0DACE] hover:bg-[#F9F7F3] text-[#9B2C2C] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <LogOut size={15} />
                <span>Desconectar desta conta</span>
              </button>
            </div>
          ) : (
            /* USER NOT LOGGED IN STATE */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#111110]">
                  Salve suas roupas na nuvem
                </h3>
                <p className="text-xs text-[#78756E] max-w-xs mx-auto">
                  Acesse suas combinações em qualquer iPhone, Android ou computador sem perder nada.
                </p>
              </div>

              {/* Notice if Firebase is not yet configured with keys */}
              {!isFirebaseReady && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={15} />
                    <span>Configuração do Firebase</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Para conectar seu projeto ao Firebase, adicione as chaves no arquivo <code className="bg-amber-100 px-1 rounded">.env.local</code> ou no painel da Vercel.
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* 1-Tap Google Login Button */}
              <button
                type="button"
                disabled={!isFirebaseReady || isSubmitting}
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 bg-white hover:bg-[#FBF9F5] border border-[#DDD7CC] rounded-2xl text-xs font-bold text-[#111110] flex items-center justify-center gap-3 shadow-sm active:scale-98 transition-all disabled:opacity-50"
              >
                {/* Google Logo SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#EAE5DC]" />
                <span className="text-[10px] text-[#78756E] uppercase font-bold tracking-wider">
                  ou e-mail
                </span>
                <div className="flex-1 h-px bg-[#EAE5DC]" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4A4843] block mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78756E]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C29F68]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4A4843] block mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78756E]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C29F68]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isFirebaseReady || isSubmitting}
                  className="w-full py-3 bg-[#18181B] text-[#FBF9F5] rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md hover:bg-[#2A2A2E] disabled:opacity-50"
                >
                  {mode === 'login' ? 'Entrar com E-mail' : 'Criar Conta Gratuita'}
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-xs text-[#78756E] hover:text-[#111110] underline"
                >
                  {mode === 'login'
                    ? 'Não tem uma conta? Crie aqui'
                    : 'Já tem conta? Faça login'}
                </button>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC] text-[11px] text-[#68655E] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#2F855A] shrink-0" />
                <span>Suas fotos são armazenadas de forma segura e privada no Google Firebase.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
