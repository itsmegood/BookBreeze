import { Outlet } from '@remix-run/react'
import { HeaderNav } from '#app/components/layout/header'

export default function LayoutAdmin() {
	return (
		<>
			<HeaderNav clean />

			<div className="flex-1">
				<Outlet />
			</div>
		</>
	)
}
