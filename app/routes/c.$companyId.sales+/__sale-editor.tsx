import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type SaleInvoice } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms'
import { StatusButton } from '#app/components/ui/status-button'
import { useIsPending } from '#app/utils/misc'
import { type action } from './__sale-editor.server'

// TODO: Make a better component to handle country, state, and city inputs
// ? Maybe a select component with api data

export const CompanySalesEditorSchema = z.object({
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

const person = {
	name: 'Lindsay Walton',
	title: 'Front-end Developer',
	email: 'lindsay.walton@example.com',
	role: 'Member',
}

export function SaleEditor({
	sale,
}: {
	sale?: SerializeFrom<
		Pick<
			SaleInvoice,
			'id' | 'totalAmount' | 'dateIssued' | 'dueDate' | 'onCredit'
		>
	>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'company-sales-editor-form',
		constraint: getZodConstraint(CompanySalesEditorSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CompanySalesEditorSchema })
		},
		defaultValue: {
			...sale,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<button type="submit" className="hidden" />
			{sale ? <input type="hidden" name="id" value={sale.id} /> : null}

			<div className="grid grid-flow-row grid-cols-6 md:grid-flow-col">
				<Field
					labelProps={{ children: 'Full Name *' }}
					inputProps={{
						...getInputProps(fields.name, { type: 'text' }),
						autoFocus: true,
					}}
					errors={fields.name.errors}
					className="md:col-span-4"
				/>
				<Field
					labelProps={{ children: 'Full Name *' }}
					inputProps={{
						...getInputProps(fields.name, { type: 'text' }),
						autoFocus: true,
					}}
					errors={fields.name.errors}
					className="md:col-span-2"
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
		</Form>
	)
}
