import {
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
} from 'lucide-react'

import Logo from '../../components/Logo'

import {
  forgotPasswordRequest,
} from '../../features/auth/services/auth.service'

function ForgotPasswordPage() {
  const navigate =
    useNavigate()

  const [email, setEmail] =
    useState('')

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccessMessage('')

    const cleanEmail =
      email
        .trim()
        .toLowerCase()

    if (!cleanEmail) {
      setError(
        'Ingresa tu correo electrónico',
      )

      return
    }

    setIsSubmitting(true)

    try {
      const response =
        await forgotPasswordRequest(
          cleanEmail,
        )

      setSuccessMessage(
        response.message,
      )

      /*
        Mientras estamos trabajando
        en desarrollo local, el backend
        devuelve el token.

        Lo utilizaremos para abrir
        directamente la pantalla
        de nueva contraseña.
      */
      if (
        response.data?.resetToken
      ) {
        window.setTimeout(
          () => {
            navigate(
              '/reset-password',
              {
                state: {
                  token:
                    response.data
                      ?.resetToken,
                  email:
                    cleanEmail,
                },
              },
            )
          },
          1200,
        )
      }
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
          'No fue posible procesar la solicitud',
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

          {/* EFECTOS DECORATIVOS */}
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

              Recuperación segura
            </div>

            <h2 className="text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
              Recupera tu acceso.
              <br />

              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Vuelve a FileVerseX.
              </span>
            </h2>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
              Ingresa el correo asociado
              a tu cuenta para iniciar
              el proceso de recuperación
              de contraseña.
            </p>

            {/* BENEFICIOS */}
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Proceso seguro
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Token temporal
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Acceso protegido
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
                Recuperar acceso
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                ¿Olvidaste tu contraseña?
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Escribe el correo
                electrónico asociado
                a tu cuenta.
              </p>
            </div>

            {/* FORMULARIO */}
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
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
                    autoComplete="email"
                    value={email}
                    disabled={
                      isSubmitting
                    }
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    placeholder="nombre@correo.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* ÉXITO */}
              {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {
                    successMessage
                  }
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

                    Procesando...
                  </>
                ) : (
                  <>
                    Continuar

                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>
            </form>

            {/* VOLVER */}
            <div className="mt-8 border-t border-slate-200 pt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ForgotPasswordPage