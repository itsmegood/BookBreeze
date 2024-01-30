import { Link, Outlet } from '@remix-run/react'

export default function Invoices() {
	return (
		<div className="flex">
			<div className="w-1/2">
				<h1>Sale Invoices Route</h1>
				<Link to="123">Invoice 123</Link>
			</div>
			<div className="w-1/2">
				<Outlet />
			</div>
		</div>
	)
}
