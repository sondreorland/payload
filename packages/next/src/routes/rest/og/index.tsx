import type { PayloadRequest } from 'payload'

import { getCreateMappedComponent, PayloadIcon } from '@payloadcms/ui/shared'
import fs from 'fs/promises'
import { ImageResponse } from 'next/og.js'
import { NextResponse } from 'next/server.js'
import path from 'path'
import React from 'react'
import { fileURLToPath } from 'url'

import { OGImage } from './image.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const runtime = 'nodejs'

export const contentType = 'image/png'

export const generateOGImage = async ({ req }: { req: PayloadRequest }) => {
  const config = req.payload.config

  if (config.admin.meta.defaultOGImageType === 'off') {
    return NextResponse.json({ error: `Open Graph images are disabled` }, { status: 400 })
  }

  try {
    const { searchParams } = new URL(req.url)

    const hasTitle = searchParams.has('title')
    const title = hasTitle ? searchParams.get('title')?.slice(0, 100) : ''
    const hasLeader = searchParams.has('leader')
    const leader = hasLeader ? searchParams.get('leader')?.slice(0, 100).replace('-', ' ') : ''
    const description = searchParams.has('description') ? searchParams.get('description') : ''

    const createMappedComponent = getCreateMappedComponent({
      importMap: req.payload.importMap,
      serverProps: {},
    })

    const mappedIcon = createMappedComponent(
      config.admin?.components?.graphics?.Icon,
      undefined,
      PayloadIcon,
      'config.admin.components.graphics.Icon',
    )

    let fontData

    try {
      // TODO: replace with `.woff2` file when supported
      // See https://github.com/vercel/next.js/issues/63935
      // Or better yet, use a CDN like Google Fonts if ever supported
      fontData = fs.readFile(path.join(dirname, 'roboto-regular.woff'))
    } catch (e) {
      req.payload.logger.error(`Error reading font file or not readable: ${e.message}`)
    }

    const fontFamily = 'Roboto, sans-serif'

    return new ImageResponse(
      (
        <OGImage
          description={description}
          fontFamily={fontFamily}
          Icon={mappedIcon}
          leader={leader}
          title={title}
        />
      ),
      {
        ...(fontData
          ? {
              fonts: [
                {
                  name: 'Roboto',
                  data: await fontData,
                  style: 'normal',
                  weight: 400,
                },
              ],
            }
          : {}),
        height: 630,
        width: 1200,
      },
    )
  } catch (e: any) {
    req.payload.logger.error(`Error generating Open Graph image: ${e.message}`)
    return NextResponse.json({ error: `Internal Server Error: ${e.message}` }, { status: 500 })
  }
}
