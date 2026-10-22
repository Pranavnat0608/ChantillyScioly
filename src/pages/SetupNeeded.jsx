import { Logo } from '../components/Layout'

export default function SetupNeeded() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-700 p-4">
      <div className="card max-w-xl p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <Logo className="h-14 w-14" />
          <h1 className="cut text-xl leading-tight">Connect Firebase to finish setup</h1>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink">
          <li>
            Create a project at <span className="font-mono">console.firebase.google.com</span> and add a <b>Web app</b>.
          </li>
          <li>
            Enable <b>Authentication → Email/Password</b> and create a <b>Firestore</b> database.
          </li>
          <li>
            Copy <span className="font-mono">.env.example</span> to <span className="font-mono">.env.local</span> and paste in your web app config values.
          </li>
          <li>
            Restart <span className="font-mono">npm run dev</span>. See the README for deploying rules and hosting.
          </li>
        </ol>
      </div>
    </div>
  )
}
