'use client'
import type { StaticPrefixSuffix } from 'payload'

import { getTranslation } from '@payloadcms/translations'
import React from 'react'

import { useTranslation } from '../../providers/Translation/index.js'
import './index.scss'

export type FieldPrefixSuffixProps = {
  className?: string
  path?: string
  prefix?: StaticPrefixSuffix
  suffix?: StaticPrefixSuffix
}

const baseClass = 'field-type'

export const FieldPrefixSuffix: React.FC<FieldPrefixSuffixProps> = (props) => {
  const { className, path, prefix, suffix } = props

  const { i18n } = useTranslation()

  if (prefix) {
    return (
      <div
        className={[
          baseClass + '__prefix',
          className,
          path && `${baseClass}__prefix-${path.replace(/\./g, '__')}`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {getTranslation(prefix, i18n)}
      </div>
    )
  }

  if (suffix) {
    return (
      <div
        className={[
          baseClass + '__suffix',
          className,
          path && `${baseClass}__suffix-${path.replace(/\./g, '__')}`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {getTranslation(suffix, i18n)}
      </div>
    )
  }

  return null
}
