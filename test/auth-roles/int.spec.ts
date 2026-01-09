import type { Payload } from 'payload'

import { jwtDecode } from 'jwt-decode'
import path from 'path'
import { fileURLToPath } from 'url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { NextRESTClient } from '../helpers/NextRESTClient.js'

import { initPayloadInt } from '../helpers/initPayloadInt.js'
import { postsSlug, usersSlug } from './shared.js'

let restClient: NextRESTClient
let payload: Payload

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

describe('Auth Roles', () => {
  let adminUser
  let editorUser
  let viewerUser
  let adminToken: string
  let editorToken: string
  let viewerToken: string
  let postId: string

  beforeAll(async () => {
    ;({ payload, restClient } = await initPayloadInt(dirname))

    adminUser = await payload.create({
      collection: usersSlug,
      data: {
        email: 'admin@test.com',
        password: 'password',
        roles: ['admin'],
      },
    })

    editorUser = await payload.create({
      collection: usersSlug,
      data: {
        email: 'editor@test.com',
        password: 'password',
        roles: ['editor'],
      },
    })

    viewerUser = await payload.create({
      collection: usersSlug,
      data: {
        email: 'viewer@test.com',
        password: 'password',
        roles: ['viewer'],
      },
    })

    const adminLoginRes = await restClient.POST(`/${usersSlug}/login`, {
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password',
      }),
    })

    const adminLogin = await adminLoginRes.json()
    adminToken = adminLogin.token

    const editorLoginRes = await restClient.POST(`/${usersSlug}/login`, {
      body: JSON.stringify({
        email: 'editor@test.com',
        password: 'password',
      }),
    })

    const editorLogin = await editorLoginRes.json()
    editorToken = editorLogin.token

    const viewerLoginRes = await restClient.POST(`/${usersSlug}/login`, {
      body: JSON.stringify({
        email: 'viewer@test.com',
        password: 'password',
      }),
    })

    const viewerLogin = await viewerLoginRes.json()
    viewerToken = viewerLogin.token

    const post = await payload.create({
      collection: postsSlug,
      data: {
        content: 'Test content',
        sensitiveData: 'Secret information',
        title: 'Test Post',
      },
    })

    postId = post.id
  })

  afterAll(async () => {
    await payload.delete({ id: adminUser.id, collection: usersSlug })
    await payload.delete({ id: editorUser.id, collection: usersSlug })
    await payload.delete({ id: viewerUser.id, collection: usersSlug })
    await payload.delete({ id: postId, collection: postsSlug })
    await payload.destroy()
  })

  describe('Roles Field', () => {
    it('should add roles field to auth collection', () => {
      const usersCollection = payload.config.collections.find((c) => c.slug === usersSlug)

      expect(usersCollection).toBeDefined()

      const rolesField = usersCollection!.fields.find((f) => 'name' in f && f.name === 'roles')

      expect(rolesField).toBeDefined()
      expect(rolesField).toHaveProperty('type', 'select')
      expect(rolesField).toHaveProperty('hasMany', true)
      expect(rolesField).toHaveProperty('required', true)
      expect(rolesField).toHaveProperty('saveToJWT', true)
    })

    it('should have correct role options', () => {
      const usersCollection = payload.config.collections.find((c) => c.slug === usersSlug)
      const rolesField = usersCollection!.fields.find(
        (f) => 'name' in f && f.name === 'roles',
      ) as any

      expect(rolesField.options).toHaveLength(3)
      expect(rolesField.options).toEqual([
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'viewer', value: 'viewer' },
      ])
    })

    it('should save roles to JWT', () => {
      const decoded = jwtDecode(adminToken)

      expect(decoded.roles).toEqual(['admin'])
    })
  })

  describe('roles() helper - collection access', () => {
    it('should allow admin to create posts', async () => {
      const res = await restClient.POST(`/${postsSlug}`, {
        body: JSON.stringify({
          content: 'Created by admin',
          title: 'Admin Post',
        }),
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      const response = await res.json()

      expect(response.doc).toBeDefined()
      expect(response.doc.title).toBe('Admin Post')

      await payload.delete({ id: response.doc.id, collection: postsSlug })
    })

    it('should allow editor to create posts', async () => {
      const res = await restClient.POST(`/${postsSlug}`, {
        body: JSON.stringify({
          content: 'Created by editor',
          title: 'Editor Post',
        }),
        headers: {
          Authorization: `Bearer ${editorToken}`,
        },
      })

      const response = await res.json()

      expect(response.doc).toBeDefined()
      expect(response.doc.title).toBe('Editor Post')

      await payload.delete({ id: response.doc.id, collection: postsSlug })
    })

    it('should prevent viewer from creating posts', async () => {
      const response = await restClient.POST(`/${postsSlug}`, {
        body: JSON.stringify({
          content: 'Should not be created',
          title: 'Viewer Post',
        }),
        headers: {
          Authorization: `Bearer ${viewerToken}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should allow public read access', async () => {
      const res = await restClient.GET(`/${postsSlug}/${postId}`)
      const response = await res.json()

      expect(response).toBeDefined()
      expect(response.title).toBe('Test Post')
    })

    it('should allow only admin to update posts', async () => {
      const adminRes = await restClient.PATCH(`/${postsSlug}/${postId}`, {
        body: JSON.stringify({
          title: 'Updated by Admin',
        }),
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      const adminResponse = await adminRes.json()

      expect(adminResponse.doc.title).toBe('Updated by Admin')

      const editorResponse = await restClient.PATCH(`/${postsSlug}/${postId}`, {
        body: JSON.stringify({
          title: 'Updated by Editor',
        }),
        headers: {
          Authorization: `Bearer ${editorToken}`,
        },
      })

      expect(editorResponse.status).toBe(403)

      await payload.update({
        id: postId,
        collection: postsSlug,
        data: { title: 'Test Post' },
      })
    })

    it('should allow only admin to delete posts', async () => {
      const testPost = await payload.create({
        collection: postsSlug,
        data: {
          content: 'Test',
          title: 'To Delete',
        },
      })

      const editorResponse = await restClient.DELETE(`/${postsSlug}/${testPost.id}`, {
        headers: {
          Authorization: `Bearer ${editorToken}`,
        },
      })

      expect(editorResponse.status).toBe(403)

      const adminResponse = await restClient.DELETE(`/${postsSlug}/${testPost.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(adminResponse.status).toBe(200)
    })
  })

  describe('roles() helper - field access', () => {
    it('should allow admin to read sensitive field', async () => {
      const res = await restClient.GET(`/${postsSlug}/${postId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      const response = await res.json()

      expect(response.sensitiveData).toBe('Secret information')
    })

    it('should hide sensitive field from non-admin users', async () => {
      const res = await restClient.GET(`/${postsSlug}/${postId}`, {
        headers: {
          Authorization: `Bearer ${editorToken}`,
        },
      })

      const response = await res.json()

      expect(response.sensitiveData).toBeUndefined()
    })

    it("should prevent all users from updating field with roles(['none'])", async () => {
      const adminRes = await restClient.PATCH(`/${postsSlug}/${postId}`, {
        body: JSON.stringify({
          sensitiveData: 'Updated',
        }),
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      const adminResponse = await adminRes.json()

      expect(adminResponse.doc.sensitiveData).toBe('Secret information')
    })
  })

  describe('roles() helper - special roles', () => {
    it("should allow public access with roles(['public'])", async () => {
      const response = await restClient.GET(`/${postsSlug}/${postId}`)

      expect(response.status).toBe(200)
    })

    it("should deny all access with roles(['none'])", async () => {
      const response = await restClient.PATCH(`/${postsSlug}/${postId}`, {
        body: JSON.stringify({
          sensitiveData: 'Should not update',
        }),
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).not.toBe(200)
    })
  })
})
