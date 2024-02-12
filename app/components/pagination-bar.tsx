import { Link, useSearchParams } from '@remix-run/react'
import { Button } from './ui/button.tsx'
import { Icon } from './ui/icon.tsx'

function setSearchParamsString(
	searchParams: URLSearchParams,
	changes: Record<string, string | number | undefined>,
) {
	const newSearchParams = new URLSearchParams(searchParams)

	for (const [key, value] of Object.entries(changes)) {
		if (value === undefined) {
			newSearchParams.delete(key)
			continue
		}

		newSearchParams.set(key, String(value))
	}

	// Print string manually to avoid over-encoding the URL
	// Browsers are ok with $ nowadays
	return Array.from(newSearchParams.entries())
		.map(([key, value]) =>
			value ? `${key}=${encodeURIComponent(value)}` : key,
		)
		.join('&')
}

export function PaginationBar({ total, top }: { total: number; top: number }) {
	const [searchParams] = useSearchParams()
	const $skip = Number(searchParams.get('$skip')) || 0
	// const $top = Number(searchParams.get('$top')) || 12
	const $top = top

	const totalPages = Math.ceil(total / $top)
	const currentPage = Math.floor($skip / $top) + 1
	const maxPages = 4
	const halfMaxPages = Math.floor(maxPages / 2)

	const canPageBackwards = $skip > 0
	const canPageForwards = $skip + $top < total

	const pageNumbers = [] as Array<number>
	if (totalPages <= maxPages) {
		for (let i = 1; i <= totalPages; i++) {
			pageNumbers.push(i)
		}
	} else {
		let startPage = currentPage - halfMaxPages
		let endPage = currentPage + halfMaxPages

		if (startPage < 1) {
			endPage += Math.abs(startPage) + 1
			startPage = 1
		}

		if (endPage > totalPages) {
			startPage -= endPage - totalPages
			endPage = totalPages
		}

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<Button size="sm" variant="outline" asChild>
				<Link
					to={{
						search: setSearchParamsString(searchParams, {
							$skip: 0,
						}),
					}}
					// preventScrollReset
					prefetch="intent"
					className={
						!canPageBackwards
							? 'pointer-events-none hidden opacity-50 md:flex'
							: 'hidden md:flex'
					}
				>
					<span className="sr-only">First page</span>
					<Icon name="double-arrow-left" />
				</Link>
			</Button>

			<Button size="sm" variant="outline" asChild>
				<Link
					to={{
						search: setSearchParamsString(searchParams, {
							$skip: Math.max($skip - $top, 0),
						}),
					}}
					// preventScrollReset
					prefetch="intent"
					className={!canPageBackwards ? 'pointer-events-none opacity-50' : ''}
				>
					<span className="sr-only">Previous page</span>
					<Icon name="arrow-left" />
				</Link>
			</Button>

			<div className="inline-flex gap-4">
				{pageNumbers.map(pageNumber => {
					const pageSkip = (pageNumber - 1) * $top
					const isCurrentPage = pageNumber === currentPage

					if (isCurrentPage) {
						return (
							<Button
								size="sm"
								variant="ghost"
								key={`${pageNumber}-active`}
								className="bg-muted px-4"
							>
								<div>
									<span className="sr-only">Page {pageNumber}</span>
									<span>{pageNumber}</span>
								</div>
							</Button>
						)
					} else {
						return (
							<Button size="sm" variant="ghost" asChild key={pageNumber}>
								<Link
									to={{
										search: setSearchParamsString(searchParams, {
											$skip: pageSkip,
										}),
									}}
									// preventScrollReset
									prefetch="intent"
									className="px-4"
								>
									{pageNumber}
								</Link>
							</Button>
						)
					}
				})}
			</div>

			<Button size="sm" variant="outline" asChild>
				<Link
					to={{
						search: setSearchParamsString(searchParams, {
							$skip: $skip + $top,
						}),
					}}
					// preventScrollReset
					prefetch="intent"
					className={!canPageForwards ? 'pointer-events-none opacity-50' : ''}
				>
					<span className="sr-only">Next page</span>
					<Icon name="arrow-right" />
				</Link>
			</Button>

			{/* <Button size="sm" variant="outline" asChild disabled={!canPageForwards}> */}
			<Button size="sm" variant="outline" asChild>
				<Link
					to={{
						search: setSearchParamsString(searchParams, {
							$skip: (totalPages - 1) * $top,
						}),
					}}
					// preventScrollReset
					prefetch="intent"
					className={
						!canPageForwards
							? 'pointer-events-none hidden opacity-50 md:flex'
							: 'hidden md:flex'
					}
				>
					<span className="sr-only">Last page</span>
					<Icon name="double-arrow-right" />
				</Link>
			</Button>
		</div>
	)
}
