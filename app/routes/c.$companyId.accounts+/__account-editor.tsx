import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type Account } from '@prisma/client'
import {
	type SerializeFrom,
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms'
import { StatusButton } from '#app/components/ui/status-button'
import { useIsPending } from '#app/utils/misc'
import {type action} from "./__account-editor.server"

// TODO: Make a better component to handle country, state, and city inputs
// ? Maybe a select component with api data

export const CompanyAccountsEditorSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(3).max(40),
	uniqueId: z.string().min(4).max(24).optional(),
	email: z.string().email().optional(),
	phone: z.string().min(7).max(15).optional(),
	address: z.string().min(4).max(40).optional(),
	country: z.string().min(4).max(24).optional(),
	city: z.string().min(4).max(24).optional(),
	state: z.string().min(4).max(24).optional(),
	zip: z.string().min(4).max(12).optional(),
	// description: z.string().min(4).max(80).optional(),
})

export function AccountEditor({
	account,
}: {
	account?: SerializeFrom<
		Pick<
			Account,
			| 'id'
			| 'name'
			| 'uniqueId'
			| 'email'
			| 'phone'
			| 'address'
			| 'country'
			| 'state'
			| 'city'
			| 'zip'
		>
	>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'company-accounts-editor-form',
		constraint: getZodConstraint(CompanyAccountsEditorSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CompanyAccountsEditorSchema })
		},
		defaultValue: {
			...account,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<button type="submit" className="hidden" />
			{account ? <input type="hidden" name="id" value={account.id} /> : null}

			<div className="grid gap-x-6 sm:grid-cols-6">
				<div className="sm:col-span-3">
					<Field
						labelProps={{ children: 'Full Name *' }}
						inputProps={{
							...getInputProps(fields.name, { type: 'text' }),
							autoFocus: true,
						}}
						errors={fields.name.errors}
					/>
				</div>

				<div className="sm:col-span-3">
					<Field
						labelProps={{ children: 'Unique ID' }}
						inputProps={getInputProps(fields.uniqueId, { type: 'text' })}
						errors={fields.uniqueId.errors}
					/>
				</div>

				<div className="sm:col-span-4">
					<Field
						labelProps={{ children: 'Email' }}
						inputProps={getInputProps(fields.email, { type: 'email' })}
						errors={fields.email.errors}
					/>
				</div>

				<div className="sm:col-span-3">
					<Field
						labelProps={{ children: 'Phone' }}
						inputProps={getInputProps(fields.phone, { type: 'tel' })}
						errors={fields.phone.errors}
					/>
				</div>

				<div className="col-span-full">
					<Field
						labelProps={{ children: 'Address' }}
						inputProps={getInputProps(fields.address, { type: 'text' })}
						errors={fields.address.errors}
					/>
				</div>

				<div className="sm:col-span-2 sm:col-start-1">
					<Field
						labelProps={{ children: 'City' }}
						inputProps={getInputProps(fields.city, { type: 'text' })}
						errors={fields.city.errors}
					/>
				</div>

				<div className="sm:col-span-2">
					<Field
						labelProps={{ children: 'State' }}
						inputProps={getInputProps(fields.state, { type: 'text' })}
						errors={fields.state.errors}
					/>
				</div>

				<div className="sm:col-span-2">
					<Field
						labelProps={{ children: 'Country' }}
						inputProps={getInputProps(fields.country, { type: 'text' })}
						errors={fields.country.errors}
					/>
				</div>
				<StatusButton
					form={form.id}
					type="submit"
					disabled={isPending}
					status={isPending ? 'pending' : 'idle'}
					className="sticky bottom-4 sm:col-span-2"
				>
					Submit
				</StatusButton>
			</div>
		</Form>
	)
}
