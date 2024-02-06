import { NavLink, Outlet } from '@remix-run/react'

const salesRoutes = [
	{
		title: 'Overview',
		href: '',
		end: true,
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

export default function AccountsLayout() {
	return (
		<>
			<h1 className="text-h3 md:text-h2">Accounts</h1>

			<nav className="grid max-w-lg grid-flow-col gap-6 overflow-y-auto py-2 [scrollbar-width:none]">
				{salesRoutes.map(route => (
					<NavLink
						key={route.title}
						className={({ isActive }) =>
							`font-semibold hover:underline ${isActive ? 'underline' : 'text-foreground/50'}`
						}
						to={route.href}
						end={route.end}
					>
						{route.title}
					</NavLink>
				))}
			</nav>

			<hr />

			<section className="space-y-6">
				<Outlet />
			</section>
		</>
	)
}
