'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { modals } from '@mantine/modals'
import CustomTable, { type CreateModalProps } from '@/src/components/CustomTable'
import CreateTaskForm from './CreateTaskForm'
import EditTaskForm from './EditTaskForm'
import ViewTask from './ViewTask'
import { buildDeleteModal } from '@/src/utils/modals'
import { Task } from '@/src/api/model/task'
import { Patient }  from '@/src/api/model/patient'
import { useQuery } from '@tanstack/react-query'
import { Session }  from 'next-auth'

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
    children: <CreateTaskForm {...props} onSuccess={
      async () => {
        modals.close(modalId)
        await props.onSuccess()
      }} />
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
  onSuccess // This is the original onSuccess (e.g., from CustomTable for refetching)
}: {
item: Task
session: Session
computedColorScheme: any
onSuccess: () => Promise<void> | void // Adjust type as per actual usage of original onSuccess
}): void {
handleShowDeleteModal({
item,
session,
computedColorScheme,
// Pass the original onSuccess directly.
// handleShowDeleteModal (buildDeleteModal) will call item.delete()
// and then call this onSuccess function.
onSuccess: async () => {
try {
// The original onSuccess (for UI refresh, etc.) is called here
await onSuccess();
} catch (error) {
// Handle any errors from the original onSuccess if necessary,
// though primary error handling for delete is in buildDeleteModal.
console.error('Error in onSuccess after task deletion:', error);
}
}
});
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

// Define an interface for tasks that includes the patient's name
interface TaskWithPatientName extends Task {
  patientName?: string;
}

export default function TasksPage (): JSX.Element {
  const guaranteedSession = useGuaranteeSession(); // Renaming for clarity, or you can keep it as 'session'
                                                 // if you rename the parameter in queryOptions

  // `viewMode` toggles between "table" and "kanban"
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  // `sortBy` chooses whether Kanban columns are by "doctor" or "expertise"
  const [sortBy, setSortBy] = useState<SortBy>('patient_id')
  
  const [tasks, setTasks] = useState<TaskWithPatientName[]>() // Use TaskWithPatientName here
  useEffect(() => {
    Task.get({}, guaranteedSession)
      .then(async ({ items }) => { 
        const tasksWithNames = await Promise.all(
          items.map(async (task) => {
            let patientName = 'N/A';
            if (task.patient_id) {
              try {
                // Use Patient.getById to fetch the patient directly
                const patient = await Patient.getById(task.patient_id, guaranteedSession);
                if (patient) {
                  patientName = patient.name;
                } else {
                  // This case should ideally not happen if patient_id is valid and refers to an existing patient
                  patientName = `ID: ${task.patient_id} (Not found)`;
                }
              } catch (e) { 
                console.error(`Failed to fetch patient name for ID ${task.patient_id} in useEffect:`, e);
                patientName = `ID: ${task.patient_id} (Error)`; 
              }
            }
            return { ...task, patientName };
          })
        );
        setTasks(tasksWithNames); 
      })
      .catch(console.error)
  }, [guaranteedSession])

  const [columns, setColumns] = useState<{headerText: string | number, keyField: string | number }[]>()
  useEffect(() => {
    kanbanColumns(guaranteedSession, sortBy)
      .then((columnsData) => {setColumns(columnsData)})
      .catch(console.error)
  }, [guaranteedSession, sortBy]);

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
                    queryOptions={(_, page, pageSize) => ({
                      queryKey: ['tasksWithPatientNames', page, pageSize],
                      queryFn: async () => {
                        const taskResponse = await Task.get(
                          { skip: pageSize * (page - 1), limit: pageSize },
                          guaranteedSession
                        );
                        const itemsWithNames = await Promise.all(
                          taskResponse.items.map(async (t) => {
                            let patientName = 'N/A';
                            if (t.patient_id) {
                              try {
                                const patient = await Patient.getById(t.patient_id, guaranteedSession);
                                patientName = patient?.name ?? `ID: ${t.patient_id} (Not found)`;
                              } catch {
                                patientName = `ID: ${t.patient_id} (Error)`;
                              }
                            }
                            return { ...t, patientName };
                          })
                        );
                        return { ...taskResponse, items: itemsWithNames };
                      }
                    })}
                    showCreateModal={showCreateModal}
                    showEditModal={showEditModal}
                    showViewModal={showViewModal}
                    showDeleteModal={showDeleteModal}
                    columns={[
                      { title: '#', accessor: 'id', toggleable: false, draggable: false, resizable: false },
                      { accessor: 'title' },
                      {
                        accessor: 'complete',
                        render: (task) => task.complete ? 'Completed' : 'Not Completed'
                      },
                      {
                        title: 'Patient',
                        accessor: 'patient_id',
                        render: t => <PatientNameCell id={t.patient_id} session={guaranteedSession} />
                      },
                      { accessor: 'expertise' },
                      { accessor: 'description' },
                      { accessor: 'created_at', render: t => dayjs(t.created_at).format('YYYY-MM-DD') },
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

// a tiny component that fetches & displays a patient’s name by ID
function PatientNameCell({
  id,
  session
}: {
  id: number
  session: Session
}) {
  const { data: patient, isLoading } = useQuery<Patient, Error>({
    queryKey: ['patient', id],
    queryFn: () => Patient.getById(id, session),
    staleTime: 5 * 60_000
  })

  if (isLoading) return 'Loading…'
  if (!patient)  return 'Unknown'
  return patient.name
}
