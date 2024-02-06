import { Link, NavLink } from '@remix-run/react'
import { Icon } from '../ui/icon.tsx'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet.tsx'

export function MobileNav({
	menuItems,
}: {
	menuItems?: {
		title?: string
		items: {
			title: string
			href: string
			end?: boolean
		}[]
	}[]
}) {
	return (
		<Sheet>
			<SheetTrigger className="flex cursor-none items-center rounded-md border border-primary p-1 lg:hidden">
				<Icon name="menu" size="lg" />
				<span className="sr-only">Toggle Menu</span>
			</SheetTrigger>
			<SheetContent
				side="left"
				className="h-screen overflow-y-auto border lg:hidden"
			>
				<div className="flex flex-col gap-4">
					<Link to="/" className="text-h4 font-semibold text-primary">
						䷸ Book<span className="text-cyan-400">Breeze</span>
					</Link>

					<ul className="divide-y">
						{menuItems?.map(item => (
							<li key={item.title} className="py-4">
								{item.title && (
									<div className="p-1 text-xl font-bold text-cyan-400">
										{item.title}
									</div>
								)}
								<ul className="flex flex-col gap-1">
									{item.items.map(subItem => (
										<li key={subItem.title}>
											<NavLink
												to={subItem.href}
												className={({ isActive }) =>
													`flex rounded-lg hover:bg-border ${isActive ? 'bg-border' : ''}`
												}
												end={subItem.end}
											>
												<SheetClose className="flex w-full p-1 px-2">
													{subItem.title}
												</SheetClose>
											</NavLink>
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</div>
			</SheetContent>
		</Sheet>
	)
}
