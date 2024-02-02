import { type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)

	return null
}

export default function StudioCompanies() {
	return (
		<div>
			<h1>Unknown Route</h1>

			<div>
				<Outlet />
			</div>
		</div>
	)
}
