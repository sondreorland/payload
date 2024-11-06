import type { DocumentInfoContext } from '@payloadcms/ui'
import type { CollectionConfig, Field, GlobalConfig, PayloadRequest } from 'payload'

export type FieldsOverride = (args: { defaultFields: Field[] }) => Field[]

export type PartialDocumentInfoContext = Pick<
  DocumentInfoContext,
  | 'collectionSlug'
  | 'docPermissions'
  | 'globalSlug'
  | 'hasPublishPermission'
  | 'hasSavePermission'
  | 'id'
  | 'initialData'
  | 'initialState'
  | 'preferencesKey'
  | 'publishedDoc'
  | 'title'
  | 'versionsCount'
>

export type GenerateTitle<T = any> = (
  args: {
    collectionConfig?: CollectionConfig
    doc: T
    globalConfig?: GlobalConfig
    locale?: string
    req: PayloadRequest
  } & PartialDocumentInfoContext,
) => Promise<string> | string

export type GenerateDescription<T = any> = (
  args: {
    collectionConfig?: CollectionConfig
    doc: T
    globalConfig?: GlobalConfig
    locale?: string
    req: PayloadRequest
  } & PartialDocumentInfoContext,
) => Promise<string> | string

export type GenerateImage<T = any> = (
  args: {
    collectionConfig?: CollectionConfig
    doc: T
    globalConfig?: GlobalConfig
    locale?: string
    req: PayloadRequest
  } & PartialDocumentInfoContext,
) => Promise<string> | string

export type GenerateURL<T = any> = (
  args: {
    collectionConfig?: CollectionConfig
    doc: T
    globalConfig?: GlobalConfig
    locale?: string
    req: PayloadRequest
  } & PartialDocumentInfoContext,
) => Promise<string> | string

export type SEOPluginConfig = {
  /**
   * Collections to include the SEO fields in
   */
  collections?: string[]
  /**
   * Override the default fields inserted by the SEO plugin via a function that receives the default fields and returns the new fields
   *
   * If you need more flexibility you can insert the fields manually as needed. @link https://payloadcms.com/docs/beta/plugins/seo#direct-use-of-fields
   */
  fields?: FieldsOverride
  generateDescription?: GenerateDescription
  generateImage?: GenerateImage
  generateTitle?: GenerateTitle
  /**
   *
   */
  generateURL?: GenerateURL
  /**
   * Globals to include the SEO fields in
   */
  globals?: string[]
  interfaceName?: string
  /**
   * Separator to be used between different segments in the generated title.
   * For example, it can be a dash ("-") or a pipe ("|") symbol.
   */
  separator?: string
  /**
   * Text to append to the generated title as a suffix.
   * This can be used for adding brand names or other static text at the end.
   */
  suffix?: string
  /**
   * Group fields into tabs, your content will be automatically put into a general tab and the SEO fields into an SEO tab
   *
   * If you need more flexibility you can insert the fields manually as needed. @link https://payloadcms.com/docs/beta/plugins/seo#direct-use-of-fields
   */
  tabbedUI?: boolean
  /**
   * The slug of the collection used to handle image uploads
   */
  uploadsCollection?: string
}

export type Meta = {
  description?: string
  image?: any // TODO: type this
  keywords?: string
  title?: string
}
