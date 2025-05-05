// src/app/tasks/EditTaskForm.tsx
'use client'

import React from 'react'
import { Button, TextInput, Textarea, NumberInput, Checkbox, Space, MantineColorScheme } from '@mantine/core'
import { useForm } from '@mantine/form'
import { type EditModalProps } from '@/src/components/CustomTable'
import { Task } from '@/src/api/model/task' // Import the correct Task model
import { type TaskUpdateScheme } from '@/src/api/scheme' // Import the update scheme
import { notEmptyValidator } from '@/src/utils/validation'
import { errorHandler } from '@/src/utils/error'
import { toast } from '@/src/utils/toast'
import { type Session } from 'next-auth'

// Remove the outdated TaskInMemory interface
/*
interface TaskInMemory {
  id: number
  name: string
  doctor: string
  patient: string
}
*/

/**
 * Update props to use the real Task model.
 */
interface EditTaskFormProps extends EditModalProps<Task> {
  session: Session
  computedColorScheme: MantineColorScheme
  onSuccess: () => Promise<void>
  item: Task
}

export default function EditTaskForm (
  {
    session,
    computedColorScheme,
    onSuccess,
    item: initialTask // Rename for clarity
  }: EditTaskFormProps
): JSX.Element {
  /**
   * Initialize the form with the existing task's fields.
   * Add 'complete' to the form state.
   */
  const form = useForm<TaskUpdateScheme & { complete: boolean }>({ // Add 'complete' to the form type
    mode: 'uncontrolled',
    validateInputOnBlur: true,
    initialValues: {
      title: initialTask.title,
      description: initialTask.description ?? '', // Handle potential null description
      expertise: initialTask.expertise ?? '', // Handle potential null expertise
      patient_id: initialTask.patient_id,
      complete: initialTask.complete // Add initial complete status
    },
    validate: {
      title: notEmptyValidator('Title is required'),
      patient_id: (value) => (value <= 0 ? 'Patient ID must be positive' : null),
    }
  })

  // Use the extended form values type including 'complete'
  async function handleSubmit (values: TaskUpdateScheme & { complete: boolean }): Promise<void> {
    // Update the initialTask object with new values before calling update
    initialTask.title = values.title
    initialTask.description = values.description
    initialTask.expertise = values.expertise
    initialTask.patient_id = values.patient_id
    initialTask.complete = values.complete // Update complete status

    // IMPORTANT: Ensure the initialTask.update() method or the backend API
    // actually supports updating the 'complete' field. If not, you might
    // need a separate API call (e.g., task.markComplete(session, values.complete)).

    await errorHandler(async () => {
      await toast(
        initialTask.update(session), // This call needs to handle 'complete'
        'Updating task...',
        'Task updated successfully!',
        'Error updating task',
        computedColorScheme
      )
      await onSuccess()
    }, computedColorScheme)
  }

  return (
    <form
      // Pass the correct values type to onSubmit
      onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
    >
      {/* Use fields from the Task model */}
      <TextInput
        label="Task Title"
        placeholder="e.g. Schedule follow-up"
        withAsterisk
        key={form.key('title')}
        {...form.getInputProps('title')}
      />

      <NumberInput
        label="Patient ID"
        placeholder="Enter patient ID"
        withAsterisk
        key={form.key('patient_id')}
        {...form.getInputProps('patient_id')}
        min={1} // Ensure positive ID
      />

      <TextInput
        label="Expertise"
        placeholder="e.g. Cardiology"
        key={form.key('expertise')}
        {...form.getInputProps('expertise')}
      />

      <Textarea
        label="Description"
        placeholder="Details about the task"
        key={form.key('description')}
        {...form.getInputProps('description')}
      />

      {/* Add Checkbox for the 'complete' field */}
      <Checkbox
        mt="md" // Add some margin top
        label="Complete"
        key={form.key('complete')}
        {...form.getInputProps('complete', { type: 'checkbox' })} // Use checkbox type binding
      />

      <Space h="md" />

      <Button type="submit" mt="md">
        Update Task
      </Button>
    </form>
  )
}
