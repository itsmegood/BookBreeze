import { Link, NavLink, Outlet } from '@remix-run/react'
import { ThemeSwitch } from '#app/components/theme-switcher'

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
		<div className="relative flex min-h-full flex-col lg:flex-row">
			<nav className="border-r bg-muted p-4 lg:w-2/12">
				<Link
					to="/"
					className="px-2 text-h5 font-semibold text-primary md:text-h4"
				>
					䷸ Book<span className="text-sky-400">Breeze</span>
				</Link>
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
				<ThemeSwitch />
			</nav>

			<section className="overflow-y-auto bg-red-400 p-4 lg:w-10/12">
				<Outlet />
			</section>
		</div>
	)
}
