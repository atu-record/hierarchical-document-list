import {usePaneRouter} from '@sanity/desk-tool'
import {ChevronRightIcon} from '@sanity/icons'
import {Button, Card, Flex} from '@sanity/ui'
import Preview from 'part:@sanity/base/preview'
import schema from 'part:@sanity/base/schema'
import React from 'react'
import {SanityTreeItem} from '../types/types'

/**
 * Renders a preview for each referenced document.
 * Nested inside TreeNode.tsx
 * @TODO: make it occupy all of the space available.
 */
const DocumentInTree: React.FC<{item: SanityTreeItem}> = (props) => {
  const {node, nodeDocType} = props.item
  const {navigateIntent, routerPanesState, ChildLink} = usePaneRouter()

  const isActive = React.useMemo(() => {
    // If some pane is active with the current document `_id`, it's active
    return routerPanesState.some((pane) => pane.some((group) => group.id === node?._ref))
  }, [routerPanesState])

  const schemaType = React.useMemo(() => schema.get(nodeDocType), [nodeDocType])

  const LinkComponent = React.useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-shadow
      React.forwardRef(function LinkComponentInner(linkProps: any, ref: any) {
        return <ChildLink {...linkProps} childId={node._ref} ref={ref} />
      }),
    [ChildLink, node._ref]
  )

  if (!node?._ref) {
    return null
  }

  return (
    // Loosely copied from @sanity/desk-tool's PaneItem.tsx
    <Card
      __unstable_focusRing
      as={LinkComponent}
      tone={isActive ? 'primary' : 'default'}
      padding={2}
      radius={2}
      data-as="a"
      data-ui="PaneItem"
    >
      <Preview layout="default" type={schemaType} value={{_ref: node?._ref}} />
    </Card>
  )
}

export default DocumentInTree
