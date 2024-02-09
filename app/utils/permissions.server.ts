import { type Prisma } from '@prisma/client'
import { json, redirect } from '@remix-run/node'
import { requireUserId } from './auth.server.ts'
import { PLATFORM_STATUS } from './constants/platform-status.ts'
import { prisma } from './db.server.ts'
import { type PermissionString, parsePermissionString } from './user.ts'

export async function requireUserWithPermission(
	request: Request,
	permission: PermissionString,
) {
	const userId = await requireUserId(request)
	const permissionData = parsePermissionString(permission)
	const user = await prisma.user.findFirst({
		select: { id: true },
		where: {
			id: userId,
			roles: {
				some: {
					permissions: {
						some: {
							...permissionData,
							access: permissionData.access
								? { in: permissionData.access }
								: undefined,
						},
					},
				},
			},
		},
	})
	if (!user) {
		throw json(
			{
				error: 'Unauthorized',
				requiredPermission: permissionData,
				message: `Unauthorized: required permissions: ${permission}`,
			},
			{ status: 403 },
		)
	}
	return user.id
}

export async function requireUserWithRole(request: Request, name: string) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findFirst({
		select: { id: true },
		where: { id: userId, roles: { some: { name } } },
	})
	if (!user) {
		throw json(
			{
				error: 'Unauthorized',
				requiredRole: name,
				message: `Unauthorized: required role: ${name}`,
			},
			{ status: 403 },
		)
	}
	return user.id
}

// TODO: Refactor this maybe?

export async function requireCompanyUserWithRBAC({
	request,
	companyId,
	permission,
	// role,
	select,
}: {
	request: Request
	companyId: string
	permission: PermissionString
	// role?: string
	select?: Prisma.UserSelect
}) {
	const userId = await requireUserId(request)
	const permissionData = parsePermissionString(permission)

	const user = await prisma.user.findFirst({
		select: select ?? { id: true },
		where: {
			id: userId,
			userCompanies: {
				some: {
					companyId,
					company: {
						platformStatusKey: PLATFORM_STATUS.ACTIVE.KEY,
					},
					OR: [
						{
							roles: {
								some: {
									// name: role,
									permissions: {
										some: {
											...permissionData,
											access: permissionData.access
												? { in: permissionData.access }
												: undefined,
										},
									},
								},
							},
						},
						{
							isOwner: true,
						},
					],
				},
			},
		},
	})
	if (!user) {
		throw redirect('/')
	}

	return user
}
