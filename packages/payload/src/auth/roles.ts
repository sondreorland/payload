import type { Access } from '../config/types.js'
import type { FieldAccess } from '../fields/config/types.js'

export function roles(allowedRoles: string[]): Access & FieldAccess {
  if (allowedRoles.includes('public')) {
    return () => true
  }

  if (allowedRoles.includes('none')) {
    return () => false
  }

  return ({ req }): boolean => {
    const { user } = req

    if (!user) {
      return false
    }

    const userRoles = user.roles

    if (!Array.isArray(userRoles) || !userRoles.every((role) => typeof role === 'string')) {
      return false
    }

    return userRoles.some((role) => allowedRoles.includes(role))
  }
}
