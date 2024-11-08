'use client'

import type { JoinFieldClient, JoinFieldClientComponent, PaginatedDocs, Where } from 'payload'

import React, { useMemo } from 'react'

import { RelationshipTable } from '../../elements/RelationshipTable/index.js'
import { FieldLabel } from '../../fields/FieldLabel/index.js'
import { useFieldProps } from '../../forms/FieldPropsProvider/index.js'
import { useField } from '../../forms/useField/index.js'
import { withCondition } from '../../forms/withCondition/index.js'
import { useDocumentInfo } from '../../providers/DocumentInfo/index.js'
import { fieldBaseClass } from '../index.js'

const JoinFieldComponent: JoinFieldClientComponent = (props) => {
  const {
    field,
    field: {
      name,
      _path: pathFromProps,
      admin: {
        allowCreate = true,
        components: { Label },
      },
      collection,
      label,
      on,
    },
  } = props

  const { id: docID } = useDocumentInfo()

  const { path: pathFromContext } = useFieldProps()

  const { value } = useField<PaginatedDocs>({
    path: pathFromContext ?? pathFromProps ?? name,
  })

  const filterOptions: Where = useMemo(() => {
    const where = {
      [on]: {
        in: [docID || null],
      },
    }
    if (field.where) {
      return {
        and: [where, field.where],
      }
    }
    return where
  }, [docID, on, field.where])

  return (
    <div className={[fieldBaseClass, 'join'].filter(Boolean).join(' ')}>
      <RelationshipTable
        allowCreate={typeof docID !== 'undefined' && allowCreate}
        field={field as JoinFieldClient}
        filterOptions={filterOptions}
        initialData={docID && value ? value : ({ docs: [] } as PaginatedDocs)}
        initialDrawerState={{
          [on]: {
            initialValue: docID,
            valid: true,
            value: docID,
          },
        }}
        Label={
          <h4 style={{ margin: 0 }}>
            <FieldLabel as="span" field={field} Label={Label} label={label} />
          </h4>
        }
        relationTo={collection}
      />
    </div>
  )
}

export const JoinField = withCondition(JoinFieldComponent)
