import type { SelectField } from '../../fields/config/types.js'
import type { Auth } from '../types.js'

export const rolesFieldConfig = (authConfig: Auth): SelectField => ({
  name: 'roles',
  type: 'select',
  admin: {
    components: {
      Field: false,
    },
  },
  hasMany: true,
  label: 'Roles',
  options:
    authConfig.roles?.map((role) => ({
      label: role.label,
      value: role.name,
    })) || [],
  required: true,
  saveToJWT: true,
})
