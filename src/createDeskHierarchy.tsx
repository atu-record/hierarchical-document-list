import S from '@sanity/desk-tool/structure-builder'
import {AddIcon} from '@sanity/icons'
import React from 'react'
import TreeDeskStructure from './TreeDeskStructure'
import {TreeDeskStructureProps} from './types/types'

interface TreeProps extends TreeDeskStructureProps {
  /**
   * Visible title above the tree.
   * Also used as the label in the desk list item.
   */
  title: string
}

const deskTreeValidator = (props: TreeProps): React.FC => {
  const {documentId, referenceTo} = props
  if (typeof documentId !== 'string' && !documentId) {
    throw new Error('[hierarchical input] Please add a documentId to your tree')
  }
  if (!Array.isArray(referenceTo)) {
    throw new Error(
      `[hierarchical input] Missing valid 'referenceTo' in createDeskHierarchy (documentId "${documentId}")`
    )
  }
  return (deskProps) => <TreeDeskStructure {...deskProps} options={props} />
}

export default function createDeskHierarchy(props: TreeProps) {
  const {documentId, referenceTo, referenceOptions} = props
  let mainList = (
    referenceTo?.length === 1
      ? S.documentTypeList(referenceTo[0]).schemaType(referenceTo[0])
      : S.documentList()
  )
    .id(documentId)
    .menuItems(
      (referenceTo || []).map((schemaType) =>
        // @TODO: ensure menu items work - menuItem().action renders
        S.menuItem()
          .intent({
            type: 'create',
            params: {type: schemaType, template: schemaType, id: 'testing'}
          })
          // @TODO: get the title for each schema type
          .title(schemaType)
          .icon(AddIcon)
      )
    )
    .canHandleIntent((intent: string, context: Record<string, unknown>) => {
      if (intent === 'edit' && context.id === props.documentId) {
        return true
      }
      return false
    })

  if (referenceOptions?.filter) {
    mainList = mainList.filter(referenceOptions.filter)
  }

  if (referenceOptions?.filterParams) {
    mainList = mainList.params(referenceOptions.filterParams)
  }

  return S.listItem()
    .id(documentId)
    .title(props.title || documentId)
    .child(
      Object.assign(
        mainList.serialize(),
        {
          type: 'component',
          component: deskTreeValidator(props),
          options: props
        },
        props.title ? {title: props.title} : {}
      )
    )
}