'use client'

import classes from './CustomTable.module.css'

import { DataTable, type DataTableColumn, useDataTableColumns } from 'mantine-datatable'
import React, { useEffect, useState } from 'react'
import { type QueryKey, useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { useGuaranteeSession } from '@/src/utils/auth'
import { ModalsProvider } from '@mantine/modals'
import {
  ActionIcon,
  Box,
  Button,
  Group,
  TextInput,
  Tooltip,
  type MantineColorScheme,
  useComputedColorScheme
} from '@mantine/core'
import {
  IconArrowAutofitWidth,
  IconColumnRemove,
  IconColumns3,
  IconEdit,
  IconMoodSad,
  IconTrash
} from '@tabler/icons-react'
import { handleUIError } from '@/src/utils/error'
import { useContextMenu } from 'mantine-contextmenu'
import { type Session } from 'next-auth'
import { type PaginationResult } from '@/src/api/common'
import { Eye, Search } from 'tabler-icons-react'

/**
 * Get text content from a React element.
 *
 * This does not add whitespace for readability: `<p>Hello <em>world</em>!</p>`
 * yields `Hello world!` as expected, but `<p>Hello</p><p>world</p>` returns
 * `Helloworld`, just like https://mdn.io/Node/textContent does.
 */
function textContent (elem: React.ReactNode): string {
  // type ReactNode = string | number | bigint | boolean
  //                | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  //                | Iterable<React.ReactNode>
  //                | React.ReactPortal | Promise<...> | null | undefined
  if (elem === null || elem === undefined) {
    return ''
  }
  if (typeof elem === 'string' ||
      typeof elem === 'number' ||
      typeof elem === 'bigint' ||
      typeof elem === 'boolean') {
    return elem.toString()
  }
  if (elem instanceof Promise) {
    throw new Error('textContent does not support promises')
  }
  if ('props' in elem) {
    return textContent(elem.props.children as React.ReactNode)
  }
  // elem is `Iterable<React.ReactNode>`
  const array = Array.from(elem)
  return array.map(textContent).join('')
}

const defaultPageSize = 5
const pageSizeOptions = [2, 5, 10, 20, 50]

interface PatientRowActionIconProps {
  icon: React.ReactElement
  color: string
  tooltip: string
  onClick: () => void
}

/**
 * Creates an action icon (small button) for a row that does something with
 * that row.
 * This is for creating the delete, edit, and view buttons in the table.
 */
function PatientRowActionIcon ({ icon, color, tooltip, onClick }: PatientRowActionIconProps): React.ReactElement {
  return (
    <Tooltip
      label={tooltip}
      position="left"
      withArrow
    >
      <ActionIcon
        size="sm"
        variant="subtle"
        color={color}
        onClick={onClick}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  )
}

interface BaseModalProps {
  session: Session
  computedColorScheme: MantineColorScheme
  /** Await this function when successfully finished with the modal. */
  onSuccess: () => Promise<void>
}

export interface DeleteModalProps<DataType> extends BaseModalProps {
  item: DataType
}

export interface EditModalProps<DataType> extends BaseModalProps {
  item: DataType
}

export interface ViewModalProps<DataType> extends BaseModalProps {
  item: DataType
}

export type CreateModalProps = BaseModalProps

interface CustomTableProps<DataType, TData extends PaginationResult<DataType> = PaginationResult<DataType>, TQueryKey extends QueryKey = QueryKey> {
  dataName: string
  storeColumnKey: string
  queryOptions: (session: Session, page: number, pageSize: number) => UseQueryOptions<TData, Error, TData, TQueryKey>
  columns: Array<DataTableColumn<DataType>>
  showDeleteModal?: (props: DeleteModalProps<DataType>) => void
  showCreateModal?: (props: CreateModalProps) => void
  showEditModal?: (props: EditModalProps<DataType>) => void
  showViewModal?: (props: ViewModalProps<DataType>) => void
}

const CustomTable = <DataType, TData extends PaginationResult<DataType> = PaginationResult<DataType>, TQueryKey extends QueryKey = QueryKey> ({
  dataName,
  storeColumnKey,
  queryOptions,
  columns,
  showDeleteModal,
  showCreateModal,
  showEditModal,
  showViewModal
}: CustomTableProps<DataType, TData, TQueryKey>): React.ReactElement<CustomTableProps<DataType, TData, TQueryKey>> => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [searchText, setSearchText] = useState('') // Should be always lowercase
  const session = useGuaranteeSession()
  const computedColorScheme = useComputedColorScheme()
  const { showContextMenu } = useContextMenu()
  const addActionColumn = showDeleteModal != null

  const {
    data,
    isLoading,
    refetch,
    error
  } = useQuery<TData, Error, TData, TQueryKey>(queryOptions(session, page, pageSize))

  useEffect(() => {
    if (error != null) {
      handleUIError(error, computedColorScheme, () => {
        void refetch()
      })
    }
  }, [computedColorScheme, error, refetch])

  const {
    effectiveColumns,
    resetColumnsOrder,
    resetColumnsToggle,
    resetColumnsWidth
  } = useDataTableColumns<DataType>({
    key: storeColumnKey,
    columns: addActionColumn
      ? [
          ...columns,
          {
            title: '',
            accessor: 'actions',
            textAlign: 'right',
            render: (item) => (
            <Group gap={4} justify="right" wrap="nowrap">
              {showDeleteModal != null && (
                <PatientRowActionIcon
                  icon={<IconTrash size={23}/>}
                  color="red"
                  tooltip="Delete"
                  onClick={() => {
                    showDeleteModal({
                      item,
                      session,
                      computedColorScheme,
                      onSuccess: async () => {
                        if (data == null) {
                          // unreachable condition. for type checking only
                          return
                        }

                        // calculate the last page after deletion
                        const lastPage = Math.max(1, Math.ceil((data.count - 1) / pageSize))
                        setPage(lastPage)
                        await refetch()
                      }
                    })
                  }}
                />
              )}
              {showEditModal != null && (
                <PatientRowActionIcon
                  icon={<IconEdit size={23}/>}
                  color="green"
                  tooltip="Edit"
                  onClick={() => {
                    showEditModal({
                      item,
                      session,
                      computedColorScheme,
                      onSuccess: async () => {
                        if (data == null) {
                          // unreachable condition. for type checking only
                          return
                        }
                        await refetch()
                      }
                    })
                  }}
                />
              )}
              {
                showViewModal != null && (
                  <PatientRowActionIcon
                    icon={<Eye size={23}/>}
                    color="blue"
                    tooltip="View"
                    onClick={() => {
                      showViewModal({
                        item,
                        session,
                        computedColorScheme,
                        onSuccess: async () => {
                          await refetch()
                        }
                      })
                    }}
                  />
                )}
            </Group>
            ),
            toggleable: false,
            draggable: false,
            resizable: false
          }
        ]
      : columns
  })

  const dataToShow = data?.items.filter(item => {
    return columns.some(column => {
      // Check if the rendered content of the column includes the search text
      const renderedText =
        column.render != null
          ? textContent(column.render(item, 0))
          : (item as any)[column.accessor] !== undefined
              ? (item as any)[column.accessor].toString()
              : ''
      return renderedText.toLowerCase().includes(searchText)
    })
  })

  return (
    <ModalsProvider>
      <Box>
        <Box
          style={{
            display: 'flex',
            marginBottom: '10px'
          }}
        >
          <TextInput
            leftSection={<Search size={16} strokeWidth={3}/>}
            placeholder="Search"
            onChange={(event) => { setSearchText(event.currentTarget.value.toLowerCase()) }}
          />
          {showCreateModal != null && (
            <Button
              onClick={() => {
                showCreateModal({
                  session,
                  computedColorScheme,
                  onSuccess: async () => {
                    await refetch()
                  }
                })
              }}
              size="sm"
              ml="auto"
            >
              Add {dataName}
            </Button>
          )}
        </Box>
        <DataTable
          striped
          highlightOnHover
          withTableBorder
          pinLastColumn={addActionColumn}
          storeColumnsKey={storeColumnKey}
          minHeight={180}
          columns={effectiveColumns}
          fetching={isLoading}
          records={dataToShow}
          page={page}
          onPageChange={setPage}
          totalRecords={data?.count}
          recordsPerPage={pageSize}
          recordsPerPageLabel={`${dataName}s per page`}
          recordsPerPageOptions={pageSizeOptions}
          onRecordsPerPageChange={(pageSize) => {
            setPageSize(pageSize)
            setPage(1)
          }}
          noRecordsIcon={
            <Box p={4} mb={4} className={classes.noRecordsBox}>
              <IconMoodSad size={36} strokeWidth={1.5}/>
            </Box>
          }
          noRecordsText="No records found"
          onRowContextMenu={({ event }) => {
            showContextMenu([
              {
                key: 'reset-toggled-columns',
                icon: <IconColumnRemove size={16}/>,
                onClick: resetColumnsToggle
              },
              {
                key: 'reset-columns-order',
                icon: <IconColumns3 size={16}/>,
                onClick: resetColumnsOrder
              },
              {
                key: 'reset-columns-width',
                icon: <IconArrowAutofitWidth size={16}/>,
                onClick: resetColumnsWidth
              }
            ])(event)
          }}
          defaultColumnProps={{
            toggleable: false,
            draggable: true,
            resizable: true
          }}
        />
      </Box>
    </ModalsProvider>
  )
}

export default CustomTable
