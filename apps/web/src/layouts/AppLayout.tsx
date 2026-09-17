import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  BarChart3,
  FileClock,
  FolderOpen,
  Globe2,
  LayoutDashboard,
  Library,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react'

import { useAuth } from '../features/auth/hooks/useAuth'
import Logo from '../components/Logo'

const API_URL =
  'http://localhost:3000'

const navigation = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Mis archivos',
    path: '/files',
    icon: FolderOpen,
  },
  {
    name: 'Colecciones',
    path: '/collections',
    icon: Library,
  },
  {
    name: 'Publicaciones',
    path: '/publications',
    icon: Globe2,
  },
  {
    name: 'Estadísticas',
    path: '/statistics',
    icon: BarChart3,
  },
  {
    name: 'Reportes',
    path: '/reports',
    icon: FileClock,
  },
  {
    name: 'Mi perfil',
    path: '/profile',
    icon: User,
  },
]

function AppLayout() {
  const navigate =
    useNavigate()

  const {
    user,
    logout,
  } = useAuth()

  /*
    ========================================
    NAVEGACIÓN
    ========================================
  */
  const navigationItems = [
    ...navigation,
  ]

  if (user?.id_rol === 1) {
    navigationItems.push({
      name: 'Administración',
      path: '/admin',
      icon: ShieldCheck,
    })
  }

  /*
    ========================================
    CERRAR SESIÓN
    ========================================
  */
  const handleLogout = () => {
    logout()

    navigate('/login', {
      replace: true,
    })
  }

  /*
    ========================================
    INICIALES DEL USUARIO
    ========================================

    Se utilizan solamente cuando el
    usuario no tiene fotografía.
  */
  const initials =
    user?.nombre_completo
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name
          .charAt(0)
          .toUpperCase(),
      )
      .join('') || 'U'

  /*
    ========================================
    FOTO DE PERFIL
    ========================================
  */
  const getProfilePhotoUrl = (
    photo?: string | null,
  ) => {
    if (
      !photo ||
      photo ===
        'default_profile.png'
    ) {
      return null
    }

    /*
      Si alguna vez la BD contiene
      una URL completa.
    */
    if (
      photo.startsWith(
        'http://',
      ) ||
      photo.startsWith(
        'https://',
      )
    ) {
      return photo
    }

    /*
      Foto almacenada en:

      apps/api/uploads/profiles
    */
    return `${API_URL}/uploads/profiles/${encodeURIComponent(
      photo,
    )}`
  }

  const profilePhotoUrl =
    getProfilePhotoUrl(
      user?.foto_perfil,
    )

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================
          SIDEBAR
      ====================================== */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">

        {/* LOGO */}
        <div className="border-b border-slate-100 px-4 py-5">

          <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-3 py-3">

            <Logo className="h-16 w-auto max-w-[230px]" />

          </div>

          <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Digital Workspace
          </p>

        </div>

        {/* =====================================
            NAVEGACIÓN
        ====================================== */}
        <nav className="flex-1 space-y-1 p-4">

          {navigationItems.map(
            (item) => {
              const Icon =
                item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({
                    isActive,
                  }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',

                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',

                    ].join(' ')
                  }
                >

                  <Icon
                    size={19}
                  />

                  {item.name}

                </NavLink>
              )
            },
          )}

        </nav>

        {/* =====================================
            USUARIO EN SIDEBAR
        ====================================== */}
        <div className="border-t border-slate-200 p-4">

          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">

            {/* FOTO / INICIALES */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white">

              {profilePhotoUrl ? (
                <img
                  src={
                    profilePhotoUrl
                  }
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}

            </div>

            {/* DATOS */}
            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.nombre_completo ??
                  'Usuario'}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email ??
                  ''}
              </p>

            </div>

          </div>

          {/* =====================================
              CERRAR SESIÓN
          ====================================== */}
          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >

            <LogOut
              size={19}
            />

            Cerrar sesión

          </button>

        </div>

      </aside>

      {/* =====================================
          CONTENIDO PRINCIPAL
      ====================================== */}
      <div className="ml-64 min-h-screen">

        {/* =====================================
            HEADER
        ====================================== */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur">

          <div>

            <p className="text-sm font-semibold text-slate-900">
              FileVerseX Workspace
            </p>

            <p className="text-xs text-slate-500">
              Gestiona tu espacio digital
            </p>

          </div>

          {/* =====================================
              USUARIO EN HEADER
          ====================================== */}
          <div className="flex items-center gap-3">

            {/* DATOS */}
            <div className="text-right">

              <p className="text-sm font-semibold text-slate-900">
                {user?.nombre_completo ??
                  'Usuario'}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email ??
                  ''}
              </p>

            </div>

            {/* FOTO / INICIALES */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">

              {profilePhotoUrl ? (
                <img
                  src={
                    profilePhotoUrl
                  }
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}

            </div>

          </div>

        </header>

        {/* =====================================
            CONTENIDO DE LAS PÁGINAS
        ====================================== */}
        <main className="p-8">
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default AppLayout