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
}: {
	action: string
	status: 'idle' | 'pending' | 'success' | 'error'
	autoFocusSearch?: boolean
	onSubmitHandler?: (e: React.FormEvent<HTMLFormElement>) => void
	autoSubmit?: boolean
	className?: string
	searchParam?: string
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
		<Form
			method="GET"
			action={action}
			className={cn(
				'flex w-full flex-wrap items-center justify-center gap-2',
				className,
			)}
			onChange={e => autoSubmit && handleFormChange(e.currentTarget)}
			onSubmit={onSubmitHandler}
		>
			<div className="flex-1" key={defaultValue}>
				<Label htmlFor={id} className="sr-only">
					Search
				</Label>
				<Input
					type="search"
					name={searchParam ?? 'search'}
					id={id}
					defaultValue={defaultValue}
					placeholder="Search"
					className="h-full w-full"
					autoFocus={autoFocusSearch}
				/>
			</div>
			<StatusButton
				type="submit"
				status={isSubmitting ? 'pending' : status}
				size="sm"
			>
				<Icon name="magnifying-glass" size="sm" />
				<span className="sr-only">Search</span>
			</StatusButton>
		</Form>
	)
}
