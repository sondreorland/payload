import type { TextField } from 'payload'

interface FieldFunctionProps {
  /**
   * Tell the component if the generate function is available as configured in the plugin config
   */
  hasGenerateFn?: boolean
  overrides?: Partial<TextField>
  separator?: string
  suffix?: string
}

type FieldFunction = ({ hasGenerateFn, overrides }: FieldFunctionProps) => TextField

export const MetaTitleField: FieldFunction = ({
  hasGenerateFn = false,
  overrides,
  separator,
  suffix,
}) => {
  return {
    name: 'title',
    type: 'text',
    admin: {
      components: {
        Field: {
          clientProps: {
            hasGenerateTitleFn: hasGenerateFn,
            separator,
            suffix,
          },
          path: '@payloadcms/plugin-seo/client#MetaTitleComponent',
        },
      },
    },
    localized: true,
    ...((overrides as unknown as TextField) ?? {}),
  }
}
