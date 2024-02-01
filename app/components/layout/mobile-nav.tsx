import { Link } from '@remix-run/react'
import { Icon } from '../ui/icon.tsx'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet.tsx'

export function MobileNav({
	menuItems,
}: {
	menuItems?: {
		title: string
		items: {
			title: string
			href: string
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
					<div className="inline-flex">
						<svg
							className="mr-2 text-primary"
							width="30"
							height="30"
							viewBox="0 0 97 85"
							fill="none"
						>
							<path
								d="M96.1608 1.3148C98.5608 36.1148 73.4941 47.1481 60.6608 48.3148C81.8608 52.3148 84.4941 71.9815 83.1608 81.3148C57.9608 85.3148 50.9941 60.9815 50.6608 48.3148C51.8608 5.9148 81.4941 -0.685196 96.1608 1.3148Z"
								fill="currentColor"
								stroke="currentColor"
							/>
							<path
								d="M1.16077 1.3148C-1.23923 36.1148 23.8274 47.1481 36.6608 48.3148C15.4608 52.3148 12.8274 71.9815 14.1608 81.3148C39.3608 85.3148 46.3274 60.9815 46.6608 48.3148C45.4608 5.9148 15.8274 -0.685196 1.16077 1.3148Z"
								fill="currentColor"
								stroke="currentColor"
							/>
						</svg>
						<span className="text-2xl font-black text-primary">
							BloomBacker
						</span>
					</div>

					<ul className="divide-y">
						{menuItems?.map(item => (
							<li key={item.title} className="py-4">
								<div className="px-2 text-xl font-bold text-primary">
									{item.title}
								</div>

								<ul>
									{item.items.map(subItem => (
										<li key={subItem.title}>
											<Link
												to={subItem.href}
												className="block cursor-none rounded-md p-2 transition hover:text-primary hover:underline"
											>
												{subItem.title}
											</Link>
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
