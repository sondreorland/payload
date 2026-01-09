import type { CollectionConfig } from 'payload'

import { fileURLToPath } from 'node:url'
import path from 'path'
import { roles } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { postsSlug, usersSlug } from './shared.js'

const Users: CollectionConfig = {
  slug: usersSlug,
  auth: {
    roles: [
      { name: 'admin', label: 'Administrator' },
      { name: 'editor', label: 'Editor' },
      'viewer',
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}

const Posts: CollectionConfig = {
  slug: postsSlug,
  access: {
    create: roles(['admin', 'editor']),
    delete: roles(['admin']),
    read: roles(['public']),
    update: roles(['admin']),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
    },
    {
      name: 'sensitiveData',
      type: 'text',
      access: {
        read: roles(['admin']),
        update: roles(['none']),
      },
    },
  ],
}

export default buildConfigWithDefaults({
  admin: {
    autoLogin: false,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Posts],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
