import { Link, NavLink, Outlet, useMatches } from '@remix-run/react'
import { UserDropdown } from '#app/components/layout/header'
import { MobileNav } from '#app/components/layout/mobile-nav'
import { SearchBar } from '#app/components/search-bar'
import { ThemeSwitch } from '#app/components/theme-switcher'

const companyRoutes = [
	{
		title: 'Dashboard',
		href: '',
		end: true,
	},
	{
		title: 'Accounts',
		href: 'accounts',
	},
	{
		title: 'Sales',
		href: 'sales',
	},
	{
		title: 'Purchases',
		href: 'purchases',
	},
	{
		title: 'Reports',
		href: 'reports',
	},
	{
		title: 'Discover',
		href: 'search',
	},
]

const mobileCompanyRoutes = [
	{
		title: 'General',
		items: companyRoutes,
	},
]

export default function LayoutCompany() {
	const matches = useMatches()
	const isSearchPage = matches.find(m => m.id === 'routes/c.$companyId+/search')

	return (
		<div className="relative flex flex-col lg:flex-row">
			<nav className="top-0 border-r bg-muted/50 p-4 lg:sticky lg:h-screen lg:w-2/12">
				<div className="flex items-center justify-between py-2">
					<div className="flex items-center">
						<MobileNav menuItems={mobileCompanyRoutes} />

						<Link
							to="/studio"
							className="px-2 text-h4 font-semibold text-primary"
						>
							Book<span className="text-cyan-400">Breeze</span>
						</Link>
					</div>

					<span className="lg:hidden">
						<UserDropdown />
					</span>
				</div>
				<ul className="mt-10 hidden text-lg font-semibold lg:block">
					{companyRoutes.map(route => (
						<li key={route.href}>
							<NavLink
								className={({ isActive }) =>
									`m-1 flex rounded-lg p-1 px-2 hover:bg-border ${isActive ? 'bg-border' : ''}`
								}
								to={route.href}
								end={route.end}
							>
								{route.title}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			<div className="flex flex-col gap-2 p-6 md:gap-4 lg:w-10/12">
				<nav className="hidden w-full gap-4 lg:flex">
					{!isSearchPage && (
						<SearchBar
							action="search"
							status="idle"
							className="hidden max-w-lg lg:flex"
						/>
					)}

					<div className="flex flex-grow justify-end gap-4">
						<ThemeSwitch />
						<UserDropdown />
					</div>
				</nav>

				<Outlet />
			</div>
		</div>
	)
}
