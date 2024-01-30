import { Link, Outlet } from '@remix-run/react'

const salesRoutes = [
	{
		title: 'Overview',
		href: '',
	},
	{
		title: 'Invoices',
		href: 'invoices',
	},
	{
		title: 'Customers',
		href: 'customers',
	},
	{
		title: 'Quotes',
		href: 'quotes',
	},
	{
		title: 'Payments',
		href: 'payments',
	},
]

export default function Sales() {
	return (
		<div>
			<h1 className="text-h3 md:text-h2">Sales</h1>

			<ul className="flex gap-4 text-lg">
				{salesRoutes.map(route => (
					<li key={route.href}>
						<Link to={route.href}>{route.title}</Link>
					</li>
				))}
			</ul>

			<section>
				<Outlet />
			</section>
		</div>
	)
}
