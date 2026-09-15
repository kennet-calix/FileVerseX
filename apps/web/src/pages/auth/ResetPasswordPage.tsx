import {
  useState,
} from 'react'

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'

import Logo from '../../components/Logo'

import {
  resetPasswordRequest,
} from '../../features/auth/services/auth.service'

interface LocationState {
  token?: string
  email?: string
}

function ResetPasswordPage() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const state =
    location.state as
      | LocationState
      | null

  const token =
    state?.token ?? ''

  const email =
    state?.email ?? ''

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    success,
    setSuccess,
  ] = useState(false)

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    if (!token) {
      setError(
        'No existe un token válido de recuperación',
      )

      return
    }

    if (
      password.length < 8
    ) {
      setError(
        'La contraseña debe contener al menos 8 caracteres',
      )

      return
    }

    if (
      !/[A-Z]/.test(
        password,
      )
    ) {
      setError(
        'La contraseña debe contener al menos una letra mayúscula',
      )

      return
    }

    if (
      !/[a-z]/.test(
        password,
      )
    ) {
      setError(
        'La contraseña debe contener al menos una letra minúscula',
      )

      return
    }

    if (
      !/[0-9]/.test(
        password,
      )
    ) {
      setError(
        'La contraseña debe contener al menos un número',
      )

      return
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        'Las contraseñas no coinciden',
      )

      return
    }

    setIsSubmitting(true)

    try {
      await resetPasswordRequest(
        token,
        password,
      )

      setSuccess(true)

      window.setTimeout(
        () => {
          navigate(
            '/login',
            {
              replace: true,
            },
          )
        },
        2000,
      )
    } catch (
      requestError
    ) {
      if (
        requestError
          instanceof Error
      ) {
        setError(
          requestError.message,
        )
      } else {
        setError(
          'No fue posible cambiar la contraseña',
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

          {/* EFECTOS DE FONDO */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          {/* LOGO */}
          <div className="relative z-10">
            <div className="inline-flex rounded-3xl bg-white px-6 py-4 shadow-2xl shadow-blue-950/40">
              <Logo className="h-36 w-auto max-w-[620px] xl:h-40" />
            </div>
          </div>

          {/* CONTENIDO */}
          <div className="relative z-10 max-w-xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 backdrop-blur">
              <ShieldCheck
                size={17}
                className="text-blue-400"
              />

              Protección de cuenta
            </div>

            <h2 className="text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
              Crea una nueva
              <br />

              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                contraseña segura.
              </span>
            </h2>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
              Define una nueva contraseña
              para recuperar el acceso
              a tu cuenta de FileVerseX.
            </p>

            {/* BENEFICIOS */}
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Contraseña segura
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Acceso protegido
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Recuperación rápida
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
            <div className="mb-10 flex justify-center lg:hidden">
              <Logo className="h-24 w-auto max-w-[380px] sm:h-28" />
            </div>

            <Link
              to="/login"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft
                size={17}
              />

              Volver al inicio de sesión
            </Link>

            {/* ENCABEZADO */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                Recuperación de cuenta
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Nueva contraseña
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ingresa y confirma
                tu nueva contraseña.
              </p>

              {email && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Cuenta
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {email}
                  </p>
                </div>
              )}
            </div>

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2
                    size={32}
                    className="text-emerald-600"
                  />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-emerald-800">
                  Contraseña actualizada
                </h2>

                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  Tu contraseña fue cambiada correctamente.
                  Serás enviado al inicio de sesión.
                </p>

                <div className="mx-auto mt-5 h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-5"
              >

                {/* NUEVA CONTRASEÑA */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nueva contraseña
                  </label>

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
                      value={
                        password
                      }
                      disabled={
                        isSubmitting
                      }
                      onChange={(
                        event,
                      ) =>
                        setPassword(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
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
                </div>

                {/* CONFIRMAR CONTRASEÑA */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirmar contraseña
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        confirmPassword
                      }
                      disabled={
                        isSubmitting
                      }
                      onChange={(
                        event,
                      ) =>
                        setConfirmPassword(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Confirma tu contraseña"
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (
                            value,
                          ) =>
                            !value,
                        )
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showConfirmPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      {showConfirmPassword ? (
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
                </div>

                {/* REQUISITOS */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Requisitos
                  </p>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <p>
                      • Mínimo 8 caracteres
                    </p>

                    <p>
                      • Una letra mayúscula
                    </p>

                    <p>
                      • Una letra minúscula
                    </p>

                    <p>
                      • Al menos un número
                    </p>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
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

                      Actualizando...
                    </>
                  ) : (
                    'Cambiar contraseña'
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ResetPasswordPage