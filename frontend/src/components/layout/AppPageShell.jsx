import { cn } from '@/lib/utils'

/**
 * main_art-like page canvas:
 * - consistent horizontal rhythm
 * - consistent max report width
 * - clean top spacing under nav
 */
export default function AppPageShell({ children, wide = false, className }) {
  return (
    <div
      className={cn(
        wide
          ? 'mx-auto w-full max-w-none bg-card py-3  sm:py-4 xl:px-6'
          : 'mx-auto w-full bg-card  py-3  sm:py-4 lg:max-w-[300mm]',
        className
      )}
    >
      {children}
    </div>
  )
}
