import { AlertForm, AlertList } from '@/components/alert'

export default function Alerts() {
  return (
    <div className="space-y-4">
      <AlertForm />
      <AlertList />
    </div>
  )
}
