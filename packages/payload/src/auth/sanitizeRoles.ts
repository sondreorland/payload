import type { Role, RoleObject } from './types.js'

export const sanitizeRoles = (roles: Role[] | undefined): RoleObject[] | undefined => {
  if (!roles || roles.length === 0) {
    return undefined
  }

  const roleNames = new Set<string>()

  return roles.map((role): RoleObject => {
    const roleConfig = typeof role === 'string' ? { name: role, label: role } : role

    if (roleNames.has(roleConfig.name)) {
      throw new Error(`Duplicate role name: "${roleConfig.name}"`)
    }

    roleNames.add(roleConfig.name)
    return roleConfig
  })
}
