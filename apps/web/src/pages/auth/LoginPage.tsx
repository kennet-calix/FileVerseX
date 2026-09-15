import { useState } from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'


import {
  loginSchema,
  type LoginFormData,
} from '../../features/auth/schemas/loginSchema'

import { useAuth } from '../../features/auth/hooks/useAuth'
import Logo from '../../components/Logo'

function LoginPage() {
  const navigate =
    useNavigate()

  const { login } =
    useAuth()

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    rememberMe,
    setRememberMe,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    serverError,
    setServerError,
  ] = useState('')

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<LoginFormData>({
    resolver:
      zodResolver(
        loginSchema,
      ),

    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (
    data: LoginFormData,
  ) => {
    setIsSubmitting(true)
    setServerError('')

    try {
      await login(
        data.email.trim(),
        data.password,
        rememberMe,
      )

      navigate(
        '/dashboard',
        {
          replace: true,
        },
      )
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setServerError(
          error.message,
        )
      } else {
        setServerError(
          'Ocurrió un error inesperado al iniciar sesión',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
    
        {/* PANEL IZQUIERDO */}
<section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">

  {/* EFECTOS DECORATIVOS DE FONDO */}
  <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

  {/* LOGO */}
  <div className="relative z-10">
    <div className="inline-flex rounded-3xl bg-white px-6 py-4 shadow-2xl shadow-blue-950/40">
      <Logo className="h-28 w-auto max-w-[580px] xl:h-32" />
    </div>
  </div>

  {/* CONTENIDO PRINCIPAL */}
  <div className="relative z-10 max-w-xl">

    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 backdrop-blur">
      <ShieldCheck
        size={17}
        className="text-blue-400"
      />

      Espacio digital seguro
    </div>

    <h2 className="text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
      Tus archivos.
      <br />

      Tus colecciones.
      <br />

      <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Tu espacio digital.
      </span>
    </h2>

    <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
      Organiza, administra y comparte tu contenido
      desde una plataforma moderna, segura y diseñada
      para trabajar mejor.
    </p>

    {/* BENEFICIOS */}
    <div className="mt-8 flex flex-wrap gap-3">
      <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
        Archivos seguros
      </span>

      <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
        Colecciones
      </span>

      <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
        Gestión centralizada
      </span>
    </div>
  </div>

  {/* FOOTER */}
  <div className="relative z-10 flex items-center justify-between">
    <p className="text-sm text-slate-600">
      © 2026 FileVerseX
    </p>

    <p className="text-xs text-slate-700">
      Gestión inteligente de archivos
    </p>
  </div>
</section>

        {/* PANEL DERECHO */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* LOGO MÓVIL */}
            <div className="mb-10 lg:hidden">
              <Logo className="h-16 w-auto max-w-[280px]" />
            </div>

            {/* ENCABEZADO */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                Bienvenido nuevamente
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Inicia sesión en tu cuenta
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ingresa tus credenciales para
                continuar a FileVerseX.
              </p>
            </div>

            {/* FORMULARIO */}
            <form
              onSubmit={handleSubmit(
                onSubmit,
              )}
              className="space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="nombre@correo.com"
                    {...register(
                      'email',
                    )}
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {
                      errors.email
                        .message
                    }
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Contraseña
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    {...register(
                      'password',
                    )}
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          value,
                        ) =>
                          !value,
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye
                        size={19}
                      />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {
                      errors.password
                        .message
                    }
                  </p>
                )}
              </div>

              {/* MANTENER SESIÓN */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={(
                    event,
                  ) =>
                    setRememberMe(
                      event.target
                        .checked,
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm text-slate-600">
                  Mantener mi sesión iniciada
                </span>
              </label>

              {/* ERROR */}
              {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar sesión

                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>
            </form>

            {/* REGISTRO */}
            <div className="mt-8 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">
                ¿Todavía no tienes
                una cuenta?{' '}

                <Link
                  to="/register"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage