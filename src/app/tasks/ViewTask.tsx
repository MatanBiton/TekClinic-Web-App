// src/app/tasks/ViewTask.tsx
'use client'

import React from 'react'
import { type MantineColorScheme, Text, Box, Stack, Checkbox } from '@mantine/core'
import { type Session } from 'next-auth'
import { Task } from '@/src/api/model/task'
import dayjs from 'dayjs'


interface ViewTaskProps {
  computedColorScheme: MantineColorScheme
  task: Task
  session: Session
}

/**
 * A simple read-only view of the Task fields,
 * similar to "ViewPatient" but no advanced logic.
 */
export default function ViewTask ({
  computedColorScheme,
  task
}: ViewTaskProps): JSX.Element {
  // If you needed to load more data (like in "ViewPatientAppointments"),
  // you could do so with a useEffect & a "Task.load()" call.
  // For now, let's keep it simple.

  return (
    <Box>
      <Stack>
        {/* Display the correct fields from the Task object */}
        <Text><strong>Task ID:</strong> {task.id}</Text>
        <Text><strong>Title:</strong> {task.title}</Text>
        <Text><strong>Description:</strong> {task.description || 'N/A'}</Text>
        <Text><strong>Expertise:</strong> {task.expertise || 'N/A'}</Text>
        <Text><strong>Patient ID:</strong> {task.patient_id}</Text>
        <Text><strong>Created At:</strong> {dayjs(task.created_at).format('YYYY-MM-DD HH:mm')}</Text>
        <Checkbox
          readOnly
          label="Complete"
          checked={task.complete}
        />
        {/* Remove fields that are not part of the Task model */}
        {/* <Text><strong>Name:</strong> {task.name}</Text> */}
        {/* <Text><strong>Doctor:</strong> {task.doctor}</Text> */}
        {/* <Text><strong>Patient:</strong> {task.patient}</Text> */}
      </Stack>
    </Box>
  )
}
