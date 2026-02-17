import { Outlet } from 'react-router-dom'

/** Wraps report pages so they use Hanuman font (Khmer-friendly). Report type for viewers is in ReportConfiguration. */
export default function ReportLayout() {
  return (
    <div className="font-hanuman min-h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  )
}
