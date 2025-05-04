'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { modals } from '@mantine/modals'
import CustomTable, { type CreateModalProps } from '@/src/components/CustomTable'
import CreateTaskForm from './CreateTaskForm'
import EditTaskForm from './EditTaskForm'
import ViewTask from './ViewTask'
import { buildDeleteModal } from '@/src/utils/modals'
import { Task } from '@/src/api/model/task'

// 1) Kanban imports, using BOOTSTRAP5 theme instead of "material"
import '@syncfusion/ej2-base/styles/bootstrap5.css'
import '@syncfusion/ej2-buttons/styles/bootstrap5.css'
import '@syncfusion/ej2-popups/styles/bootstrap5.css'
import '@syncfusion/ej2-inputs/styles/bootstrap5.css'
import '@syncfusion/ej2-react-kanban/styles/bootstrap5.css'

import {
  KanbanComponent,
  ColumnsDirective,
  ColumnDirective,
  CardSettingsModel
} from '@syncfusion/ej2-react-kanban'

import { Button, Radio, Group } from '@mantine/core'
import {Session} from "next-auth";
import {useGuaranteeSession} from '@/src/utils/auth'
import dayjs from 'dayjs';

// ----------------------------
// "Add Task" Modal
// ----------------------------
function showCreateModal (props: CreateModalProps): void {
  const modalId = 'create-task-modal'
  modals.open({
    modalId,
    title: 'Add Task',
    children: <CreateTaskForm {...props} />
    // TODO: Rename this to be onSuccess to be more consistent with other
    // CreatePatientForm.tsx and friends, and make this async!
    // Look at CreatePatientForm.tsx for an example, with the use of a
    // toast for pretty feedback.
    // UPDATE: Did this for this modal, should do this for the other
    // two modals
  })
}

// ----------------------------
// "Edit Task" Modal
// ----------------------------
function showEditModal ({
                                item,
                                session,
                                computedColorScheme,
                                onSuccess
                              }: any): void {
  const modalId = 'edit-task-modal'
  modals.open({
    modalId,
    title: 'Edit Task',
    children: (
        <EditTaskForm
            item={item}
            session={session}
            computedColorScheme={computedColorScheme}
            onSuccess={async () => {
              modals.close(modalId)
              await onSuccess()
            }}
        />
    )
  })
}

// ----------------------------
// "View Task" Modal
// ----------------------------
function showViewModal ({
                                item,
                                session,
                                computedColorScheme,
                                onSuccess
                              }: any): void {
  const modalId = 'view-task-modal'
  modals.open({
    modalId,
    title: 'Task Information',
    children: (
        <ViewTask
            task={item}
            session={session}
            computedColorScheme={computedColorScheme}
        />
    )
  })
}

// ----------------------------
// "Delete Task" Modal
// ----------------------------
const handleShowDeleteModal = buildDeleteModal<Task>(
    'task',
    (task) => task.title
)

function showDeleteModal ({
                              item,
                              session,
                              computedColorScheme,
                              onSuccess
                            }: {
  item: Task
  session: any
  computedColorScheme: any
  onSuccess: () => Promise<void>
}): void {
  handleShowDeleteModal({
    item,
    session,
    computedColorScheme,
    onSuccess: async () => {
      await item.delete(session)
      await onSuccess()
    }
  })
}

// -------------------------------------------------------------
// KANBAN LOGIC
// -------------------------------------------------------------

/** Task fields that we can sort by */
type SortBy = 'patient_id' | 'expertise'

/** This function returns a set of values based on the `sortBy` field, as an array */
async function uniqueGroups(session: Session, sortBy: SortBy): Promise<any[]> {
  const setOfGroups = new Set<string | number>()
  const tasks = await Task.get({}, session)
  tasks.items.forEach((t) => {
    const fieldValue = t[sortBy]
    if (fieldValue) {
      setOfGroups.add(fieldValue)
    }
  })
  // TODO: Change return type to a set
  return Array.from(setOfGroups)
}

type KanbanColumn = {
  headerText: string | number
  keyField: string | number
}

async function kanbanColumns (session: Session, sortBy: SortBy): Promise<KanbanColumn[]> {
  const groups = await uniqueGroups(session, sortBy)
  return groups.map(groupValue => ({
    headerText: groupValue,
    keyField: groupValue
  }))
}

const cardSettings: CardSettingsModel = {
  headerField: 'name',
  contentField: 'doctor'
}

export default function TasksPage (): JSX.Element {
  const session = useGuaranteeSession()

  // `viewMode` toggles between "table" and "kanban"
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  // `sortBy` chooses whether Kanban columns are by "doctor" or "expertise"
  const [sortBy, setSortBy] = useState<SortBy>('patient_id')

  // TODO: Replace console.error calls with a toasttttt
  
  const [tasks, setTasks] = useState<Task[]>()
  useEffect(() => {
    Task.get({}, session)
      .then(({ items }) => { setTasks(items) })
      .catch(console.error)
  }, [session])

  const [columns, setColumns] = useState<{headerText: string | number, keyField: string | number }[]>()
  useEffect(() => {
    kanbanColumns(session, sortBy)
      .then((columnsData) => {setColumns(columnsData)})
      .catch(console.error)
  }, [session, sortBy]);

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
      <div>
        <h1>Tasks</h1>

        <div style={{ marginBottom: 16 }}>
          <Button
              onClick={() =>
                  setViewMode(viewMode === 'table' ? 'kanban' : 'table')
              }
          >
            Switch to {viewMode === 'table' ? 'Kanban' : 'Table'}
          </Button>

          {/* Only display "Sort by" in Kanban mode */}
          {viewMode === 'kanban' && (
              <div style={{ marginTop: 16 }}>
                <Radio.Group
                    value={sortBy}
                    onChange={(value) => setSortBy(value as 'patient_id' | 'expertise')}
                    label="Sort by"
                >
                  <Group mt="xs">
                    <Radio value="doctor" label="Doctor" />
                    <Radio value="patient" label="Patient" />
                  </Group>
                </Radio.Group>
              </div>
          )}
        </div>

        {viewMode === 'table'
            ? (
                <CustomTable<Task>
                    dataName="Task"
                    storeColumnKey="task-columns"
                    queryOptions={(session, page, pageSize) => ({
                      queryKey: ['tasks', page, pageSize],
                      queryFn: async () => {
                        return await Task.get({
                          skip: pageSize * (page - 1),
                          limit: pageSize
                        }, session)
                      }
                    })}
                    showCreateModal={showCreateModal}
                    showEditModal={showEditModal}
                    showViewModal={showViewModal}
                    showDeleteModal={showDeleteModal}
                    columns={[
                      { title: '#', accessor: 'id', toggleable: false, draggable: false, resizable: false },
                      { accessor: 'title' },
                      { accessor: 'complete' },
                      { accessor: 'patient_id' },
                      { accessor: 'expertise' },
                      { accessor: 'description' },
                      { accessor: 'created_at', render: task => dayjs(task.created_at).format('YYYY-MM-DD') },
                    ]}
                />
            )
            : (
                <KanbanComponent
                    id="kanban"
                    keyField={sortBy}
                    dataSource={tasks}
                    cardSettings={cardSettings}
                    allowDragAndDrop={true}
                    swimlaneSettings={{ allowSwimlane: false }}
                    style={{ marginTop: 20 }}
                >
                  <ColumnsDirective>
                    {
                      columns?.map((col) => (
                          <ColumnDirective
                              key={col.keyField}
                              headerText={String(col.headerText)}
                              keyField={col.keyField}
                          />
                      ))}
                  </ColumnsDirective>
                </KanbanComponent>
            )}
      </div>
  )
}
