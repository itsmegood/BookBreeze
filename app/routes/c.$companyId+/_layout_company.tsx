import { Link, NavLink, Outlet } from '@remix-run/react'
import { UserDropdown } from '#app/components/layout/header'
import { MobileNav } from '#app/components/layout/mobile-nav'
import { SearchBar } from '#app/components/search-bar'
import { ThemeSwitch } from '#app/components/theme-switcher'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'

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

const mobileCompanyRoutes = [
	{
		title: 'General',
		items: [
			{
				title: 'Dashboard',
				href: '',
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
				title: 'Purchase',
				href: 'purchase',
			},
			{
				title: 'Reports',
				href: 'reports',
			},
		],
	},
]

export default function LayoutCompany() {
	return (
		<div className="relative flex flex-col lg:flex-row">
			<nav className="top-0 border-r bg-muted/50 p-4 lg:sticky lg:h-screen lg:w-2/12">
				<div className="flex items-center justify-between">
					<div className="flex">
						<MobileNav menuItems={mobileCompanyRoutes} />

						<Link to="/" className="px-2 text-h4 font-semibold text-primary">
							䷸ Book<span className="text-cyan-400">Breeze</span>
						</Link>
					</div>
					{/* <Link to="search" className="lg:hidden">
						<Button size="sm">
							<Icon name="magnifying-glass" size="sm" />
							<span className="sr-only">Search</span>
						</Button>
					</Link> */}
					<span className="lg:hidden">
						<UserDropdown />
					</span>
				</div>
				<ul className="my-10 hidden text-lg font-semibold lg:block">
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

			<section className="flex flex-col gap-4 p-4 lg:w-10/12">
				<header className="hidden w-full justify-between gap-4 lg:flex">
					{/* {!isProjectPage && ( */}
					<SearchBar
						action="/search"
						status="idle"
						className="hidden max-w-lg lg:flex"
					/>
					{/* )} */}

					<div className="flex gap-4">
						<ThemeSwitch />
						<UserDropdown />
					</div>
				</header>

				<Outlet />
			</section>
		</div>
	)
}
