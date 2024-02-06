import { Link, Outlet } from '@remix-run/react'

export default function Bills() {
	return (
		<div className="flex">
			<div className="w-1/2">
				<h1>Purchase Bills Route</h1>
				<Link to="123">Bill 123</Link>
			</div>
			<div className="w-1/2">
				<Outlet />
			</div>
		</div>
	)
}
