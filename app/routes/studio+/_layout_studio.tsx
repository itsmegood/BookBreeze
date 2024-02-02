import { Outlet } from '@remix-run/react'
import { HeaderNav } from '#app/components/layout/header'

export default function LayoutStudio() {
	return (
		<>
			<HeaderNav clean />

			<div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-6">
				<Outlet />
			</div>
		</>
	)
}
