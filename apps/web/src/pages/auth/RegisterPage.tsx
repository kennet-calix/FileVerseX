import {
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  ArrowRight,
  Camera,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from 'lucide-react'

import Logo from '../../components/Logo'

import {
  registerSchema,
  type RegisterFormData,
} from '../../features/auth/schemas/registerSchema'

import {
  registerRequest,
} from '../../features/auth/services/auth.service'

function RegisterPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [profileImage, setProfileImage] =
    useState<string | null>(null)

  const [registerError, setRegisterError] =
    useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      description: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

const password =
  watch('password') ?? ''

const passwordRequirements = useMemo(
  () => [
    {
      label: 'Mínimo 8 caracteres',
      valid: password.length >= 8,
    },
    {
      label: 'Máximo 16 caracteres',
      valid:
        password.length > 0 &&
        password.length <= 16,
    },
    {
      label: 'Una letra mayúscula',
      valid: /[A-Z]/.test(password),
    },
    {
      label: 'Una letra minúscula',
      valid: /[a-z]/.test(password),
    },
    {
      label: 'Un número',
      valid: /[0-9]/.test(password),
    },
  ],
  [password],
)
  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setRegisterError(
        'La foto de perfil debe ser una imagen válida',
      )
      return
    }

    if (profileImage) {
      URL.revokeObjectURL(profileImage)
    }

    const imageUrl =
      URL.createObjectURL(file)

    setProfileImage(imageUrl)
  }

  const onSubmit = async (
    data: RegisterFormData,
  ) => {
    setIsSubmitting(true)
    setRegisterError('')

    try {
      await registerRequest(
        data.fullName.trim(),
        data.email.trim(),
        data.password,
        data.description?.trim() ?? '',
      )

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      if (error instanceof Error) {
        setRegisterError(
          error.message,
        )
      } else {
        setRegisterError(
          'No fue posible crear la cuenta',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">

        {/* PANEL IZQUIERDO */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">

          {/* EFECTOS DE FONDO */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          {/* LOGO */}
          <div className="relative z-10">
            <div className="inline-flex rounded-3xl bg-white px-6 py-4 shadow-2xl shadow-blue-950/40">
              <Logo className="h-28 w-auto max-w-[520px] xl:h-32" />
            </div>
          </div>

          {/* CONTENIDO */}
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
              Crea tu espacio
            </p>

            <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
              Organiza tu mundo digital
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}
                en un solo lugar.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Gestiona tus archivos, crea
              colecciones y mantén tu contenido
              organizado desde una plataforma
              moderna y segura.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Archivos seguros
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Colecciones
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300">
                Espacio personal
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

        {/* FORMULARIO */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-2xl">

            {/* LOGO MÓVIL */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo className="h-20 w-auto max-w-[340px] sm:h-24" />
            </div>

            {/* ENCABEZADO */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                Comienza ahora
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Crear una cuenta
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Completa tu información para
                crear tu espacio personal.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >

              {/* FOTO */}
              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Foto de perfil
                </label>

                <div className="flex items-center gap-5">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Vista previa del perfil"
                        className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                        <User size={30} />
                      </div>
                    )}

                    <label
                      htmlFor="profileImage"
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow transition hover:bg-blue-700"
                    >
                      <Camera size={16} />
                    </label>

                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Agrega una fotografía
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG o WEBP.
                    </p>
                  </div>
                </div>
              </div>

              {/* NOMBRE + CORREO */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nombre completo
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="fullName"
                      type="text"
                      placeholder="Tu nombre completo"
                      {...register('fullName')}
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none transition ${
                        errors.fullName
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                  </div>

                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

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
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nombre@correo.com"
                      {...register('email')}
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none transition ${
                        errors.email
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Descripción personal
                </label>

                <textarea
                  id="description"
                  rows={3}
                  placeholder="Cuéntanos brevemente sobre ti..."
                  {...register('description')}
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
                    errors.description
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                />

                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* PASSWORDS */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Contraseña
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      placeholder="Crea una contraseña"
                      {...register('password')}
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm outline-none transition ${
                        errors.password
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value,
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
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

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
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      placeholder="Repite tu contraseña"
                      {...register('confirmPassword')}
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm outline-none transition ${
                        errors.confirmPassword
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value,
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
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* REQUISITOS PASSWORD */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  La contraseña debe contener:
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {passwordRequirements.map(
                    (requirement) => (
                      <div
                        key={requirement.label}
                        className={`flex items-center gap-2 text-sm ${
                          requirement.valid
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full ${
                            requirement.valid
                              ? 'bg-emerald-100'
                              : 'bg-slate-100'
                          }`}
                        >
                          <Check size={13} />
                        </div>

                        {requirement.label}
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* TÉRMINOS */}
              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm leading-6 text-slate-600">
                    Acepto los términos de uso y
                    la política de privacidad de
                    FileVerseX.
                  </span>
                </label>

                {errors.acceptTerms && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              {/* ERROR BACKEND */}
              {registerError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {registerError}
                </div>
              )}

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN */}
            <div className="mt-8 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">
                ¿Ya tienes una cuenta?{' '}

                <Link
                  to="/login"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RegisterPage