import { NavLink, Outlet } from '@remix-run/react'

const companyRoutes = [
	{
		title: 'Accounts',
		href: 'accounts',
	},
	{
		title: 'Sales',
		href: 'sales',
	},
	{
		title: 'Purchase',
		href: 'purchase',
	},
	{
		title: 'Reports',
		href: 'reports',
	},
]

export default function LayoutCompany() {
	return (
		<div className="flex h-full flex-col lg:flex-row">
			<nav className="border-r bg-muted p-4 lg:w-2/12">
				<h1 className="px-2 text-h3 text-primary">BookBreeze</h1>
				<ul className="my-10 text-lg font-semibold">
					<li>
						<NavLink
							className={({ isActive }) =>
								`m-1 flex rounded-lg p-1 px-2 hover:bg-border ${isActive ? 'bg-border' : ''}`
							}
							to=""
							end
						>
							Dashboard
						</NavLink>
					</li>

					{companyRoutes.map(route => (
						<li key={route.href}>
							<NavLink
								className={({ isActive }) =>
									`m-1 flex rounded-lg p-1 px-2 hover:bg-border ${isActive ? 'bg-border' : ''}`
								}
								to={route.href}
							>
								{route.title}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			<section className="p-4 lg:w-10/12">
				<header className="bg-gray-200 p-4">
					<h2 className="text-xl font-semibold">Header</h2>
				</header>
				<Outlet />
			</section>
		</div>
	)
}
