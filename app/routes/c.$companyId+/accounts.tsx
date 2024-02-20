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
		href: 'cust',
	},
	{
		title: 'New Account',
		href: 'new',
	},
	{
		title: 'Payments',
		href: 'payments',
	},
]

export default function CustomerAccountsLayout() {
	return (
		<>
			{/* <div className="flex items-center justify-between"> */}
			<h2 className="text-h3 md:text-h2">Accounts</h2>
			{/* <Link to="new">
					<Button>Add Account</Button>
					</Link>
				</div> */}

			<div className="sticky top-0 bg-background">
				<nav className="grid grid-flow-col gap-4 overflow-x-auto whitespace-nowrap py-4 text-lg font-semibold [scrollbar-width:none] md:w-fit">
					{salesRoutes.map(route => (
						<NavLink
							key={route.title}
							className={({ isActive }) =>
								`px-2 py-1 hover:underline ${isActive ? 'rounded-md bg-cyan-400 text-background' : 'text-foreground/45'}`
							}
							to={route.href}
							end={route.end}
						>
							{route.title}
						</NavLink>
					))}
				</nav>
				<hr />
			</div>

			<section className="space-y-6">
				<Outlet />
			</section>
		</>
	)
}
