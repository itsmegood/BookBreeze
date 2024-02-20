import { Form, useSearchParams, useSubmit } from '@remix-run/react'
import { useId } from 'react'
import { cn, useDebounce, useIsPending } from '#app/utils/misc.tsx'
import { Icon } from './ui/icon.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { StatusButton } from './ui/status-button.tsx'

export function SearchBar({
	action,
	status,
	autoFocusSearch = false,
	autoSubmit = false,
	onSubmitHandler,
	className,
	searchParam,
	searchRef,
}: {
	action: string
	status: 'idle' | 'pending' | 'success' | 'error'
	autoFocusSearch?: boolean
	onSubmitHandler?: (e: React.FormEvent<HTMLFormElement>) => void
	autoSubmit?: boolean
	className?: string
	searchParam?: string
	searchRef?: React.RefObject<HTMLInputElement>
}) {
	const id = useId()
	const [searchParams] = useSearchParams()
	let defaultValue = searchParams.get(searchParam ?? 'search') || ''

	const submit = useSubmit()
	const isSubmitting = useIsPending({
		formMethod: 'GET',
		formAction: action,
	})

	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form)
	}, 400)

	return (
		<div className="flex gap-4">
			<Form
				method="GET"
				action={action}
				className={cn('w-full sm:min-w-[368px]', className)}
				onChange={e => autoSubmit && handleFormChange(e.currentTarget)}
				onSubmit={onSubmitHandler}
			>
				<div key={defaultValue} className="w-full">
					<Label htmlFor={id} className="sr-only">
						Search
					</Label>
					<Input
						ref={searchRef}
						type="search"
						name={searchParam ?? 'search'}
						id={id}
						defaultValue={defaultValue}
						placeholder="Search"
						autoFocus={autoFocusSearch}
					/>
				</div>
			</Form>
			<StatusButton
				tabIndex={autoSubmit ? -1 : 0}
				type="submit"
				status={isSubmitting ? 'pending' : status}
			>
				<Icon name="magnifying-glass">
					<span className="hidden md:flex">Search</span>
				</Icon>
			</StatusButton>
		</div>
	)
}
