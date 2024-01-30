import { Form, Link, useMatches, useSubmit } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'

import { getUserImgSrc } from '#app/utils/misc.tsx'
import { useOptionalUser, useUser } from '#app/utils/user.ts'
import { SearchBar } from '../search-bar.tsx'
import { Button } from '../ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu.tsx'
import { Icon } from '../ui/icon.tsx'
import { MobileNav } from './mobile-nav.tsx'

export function HeaderNav({
	sticky,
	mobileNavItems,
	clean = false,
}: {
	sticky?: boolean
	mobileNavItems?: {
		title: string
		items: {
			title: string
			href: string
		}[]
	}[]
	clean?: boolean
}) {
	const user = useOptionalUser()

	const [searchExpand, setSearchExpand] = useState(false)
	const searchRef = useRef<HTMLInputElement>(null)

	const matches = useMatches()
	const isProjectPage = matches.find(
		match => match.id === 'routes/projects+/index',
	)

	const handleSearchExpand = () => {
		setSearchExpand(true)
		// searchRef.current?.focus()
	}

	useEffect(() => {
		if (searchExpand && searchRef.current) {
			searchRef.current.focus()
		}
	}, [searchExpand])

	return (
		<>
			<header
				className={
					sticky
						? 'sticky top-0 z-50 rounded-sm bg-background/95 shadow-sm backdrop-blur-md'
						: 'shadow-sm'
				}
			>
				<nav className="inline-flex w-full items-center justify-between p-3">
					<div className="flex items-center justify-between gap-2 md:w-1/4">
						<MobileNav menuItems={mobileNavItems} />

						<Link to="/" className="inline-flex items-center">
							<svg
								className="mr-2 cursor-none text-primary lg:cursor-auto"
								width="35"
								height="35"
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
							<span className="hidden text-2xl font-semibold text-primary md:block">
								BloomBacker
							</span>
						</Link>
					</div>

					{!clean && (
						<>
							<div
								className={
									searchExpand
										? 'absolute left-0 top-0 z-50 inline-flex w-full items-center justify-center gap-2 border-b bg-background p-3 md:hidden'
										: 'flex px-8 md:w-2/4'
								}
							>
								{searchExpand && (
									<Button size="sm" onClick={() => setSearchExpand(false)}>
										<Icon name="arrow-left" size="sm" />
										<span className="sr-only">Search</span>
									</Button>
								)}

								{!isProjectPage && (
									<SearchBar
										action="/projects"
										status="idle"
										searchRef={searchRef}
										onSubmitHandler={_ => {
											searchRef.current?.blur()
											setSearchExpand(false)
										}}
										className={searchExpand ? '' : 'hidden md:flex'}
									/>
								)}
							</div>

							<div className="flex items-center justify-end md:w-1/4 md:justify-between">
								<div className="hidden items-center gap-4 md:inline-flex">
									<Button asChild size="sm">
										<Link to="/projects">
											<Icon name="compass" size="sm">
												<span className="hidden md:block">Discover</span>
											</Icon>
										</Link>
									</Button>
									<Button asChild variant="link">
										<Link to="/studio/projects/new" className="hidden lg:flex">
											Start A Project
										</Link>
									</Button>
								</div>

								<div className="inline-flex gap-4">
									{!searchExpand && (
										<>
											<Button asChild size="sm">
												<Link to="/projects" className="md:hidden">
													<Icon name="compass" size="sm" />
												</Link>
											</Button>
											{!isProjectPage && (
												<Button
													size="sm"
													variant="outline"
													onClick={handleSearchExpand}
													className="md:hidden"
												>
													<Icon name="magnifying-glass" size="sm" />
													<span className="sr-only">Search</span>
												</Button>
											)}
										</>
									)}
								</div>
							</div>
						</>
					)}

					{user ? (
						<UserDropdown />
					) : (
						<Button
							asChild
							variant="default"
							size="sm"
							className="whitespace-nowrap"
						>
							<Link to="/login">Log In</Link>
						</Button>
					)}
					{/* <div className="block w-full sm:hidden">{searchBar}</div> */}
				</nav>
			</header>
		</>
	)
}

function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<div
					// this is for progressive enhancement
					onClick={e => e.preventDefault()}
					className="relative rounded-full border border-primary bg-secondary p-1"
				>
					<div className="absolute right-0 top-0 rounded-full bg-background p-[1px]">
						<div className="z-10 h-2 w-2 rounded-full bg-emerald-500"></div>
					</div>
					<img
						className="h-7 w-7 rounded-full object-cover"
						alt={user.name ?? user.username}
						src={getUserImgSrc(user.image?.id)}
					/>
					{/* <span className="font-bold text-body-sm">
						{user.name ?? user.username}
					</span> */}
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent
					sideOffset={22}
					align="end"
					className="min-w-[20rem] rounded-sm border border-primary"
				>
					<DropdownMenuItem asChild className="border-b p-3">
						<Link
							prefetch="intent"
							to={`/users/${user.username}`}
							className="inline-flex w-full items-center gap-2 bg-muted/30 hover:bg-accent"
						>
							<div className="rounded-full bg-background p-1">
								<img
									className="h-7 w-7 rounded-full object-cover"
									alt={user.name ?? user.username}
									src={getUserImgSrc(user.image?.id)}
								/>
							</div>
							<div>
								<span className="text-lg">{user.username}</span>
								<div className="text-xs">{user.name}</div>
							</div>
						</Link>
					</DropdownMenuItem>
					<div className="border-b p-2">
						<DropdownMenuItem asChild className="p-2">
							<div className="text-xs font-bold">BACKER</div>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="p-2">
							<Link prefetch="intent" to="/" className="hover:bg-muted/30">
								Home
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="p-2">
							<Link
								prefetch="intent"
								to="/projects"
								className="hover:bg-muted/30"
							>
								Discover
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="p-2">
							<Link
								prefetch="intent"
								to="/studio/backed-projects"
								className="hover:bg-muted/30"
							>
								Backed Projects
							</Link>
						</DropdownMenuItem>
					</div>
					<div className="border-b p-2">
						<DropdownMenuItem asChild className="p-2">
							<div className="text-xs font-bold">CREATOR</div>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="p-2">
							<Link
								prefetch="intent"
								to="/studio"
								className="hover:bg-muted/30"
							>
								Studio
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="p-2">
							<Link
								prefetch="intent"
								to="/studio/projects"
								className="hover:bg-muted/30"
							>
								Created Projects
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="p-2">
							<Link
								prefetch="intent"
								to="/studio/projects/new"
								className="hover:bg-muted/30"
							>
								Start a New Project
							</Link>
						</DropdownMenuItem>
					</div>
					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={event => {
							event.preventDefault()
							submit(formRef.current)
						}}
						className="cursor-pointer p-4 text-sm"
					>
						<Form
							action="/logout"
							method="POST"
							ref={formRef}
							className="bg-muted/30"
						>
							<Icon name="exit">
								<button>Sign Out</button>
							</Icon>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}
