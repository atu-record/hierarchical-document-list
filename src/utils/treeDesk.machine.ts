import {SanityDocument} from '@sanity/client'
import {TreeItem} from 'react-sortable-tree'
import {createMachine} from 'xstate'
import {TreeDeskStructureProps} from '../types/types'

export const treeDeskMachine = createMachine({
  initial: 'loading',
  context: {
    treeDocId: '',
    filter: undefined,
    params: undefined,
    localTransactions: [],
    mainTree: undefined,
    allItems: undefined,
    unaddedItems: undefined
  } as TreeDeskStructureProps & {
    localTransactions: string[]
    mainTree?: TreeItem[]
    allItems?: SanityDocument[]
    unaddedItems?: TreeItem[]
  },
  states: {
    loading: {
      invoke: {
        src: 'loadData',
        onDone: [
          {
            target: 'loaded',
            actions: 'setLoadedData',
            cond: 'treeIsValid'
          },
          {
            target: 'creatingDocument',
            actions: 'setLoadedData'
          }
        ],
        onError: {
          target: 'error'
        }
      }
    },
    creatingDocument: {
      invoke: {
        src: 'createDocument',
        onDone: {
          target: 'loaded',
          actions: 'setLoadedData'
        },
        onError: {
          target: 'error'
        }
      }
    },
    loaded: {
      invoke: {
        src: 'subscribeListener'
      },
      on: {
        HANDLE_LISTENER: {
          actions: 'handleListener'
        },
        UPDATE_MAIN_TREE: {
          actions: 'setLoadedData',
          cond: 'treeIsValid'
        },
        HANDLE_MAIN_TREE_CHANGE: {
          // First go to idle, then to persisting to ensure we re-invoke persistChanges.
          // @TODO: what happens if the skipped transaction(s) errors?
          target: ['.idle', '.persisting']
        },
        HANDLE_UNADDED_TREE_CHANGE: {
          actions: 'handleUnaddedTreeChange'
        }
      },
      initial: 'idle',
      states: {
        idle: {},
        persisting: {
          invoke: {
            src: 'persistChanges',
            onDone: {
              target: 'idle'
            },
            onError: {
              target: 'persistError'
            }
          }
        },
        persistError: {
          after: {
            3000: {
              target: 'idle'
            }
          }
        }
      }
    },
    error: {
      on: {
        RETRY_LOAD: 'loading'
      }
    }
  }
})