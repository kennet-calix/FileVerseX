import { Files } from 'lucide-react'

function AuthBrand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
        <Files size={22} />
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">
          FileVerseX
        </h1>

        <p className="text-xs text-slate-500">
          Digital Workspace
        </p>
      </div>
    </div>
  )
}

export default AuthBrand