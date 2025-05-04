import React, { useState } from 'react'
import { Button, Checkbox, MantineColorScheme, NumberInput, Space, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { CreateModalProps } from '@/src/components/CustomTable'
import { notEmptyValidator } from '@/src/utils/validation';
import { Task } from '@/src/api/model/task';
import { TaskBaseScheme } from '@/src/api/scheme';
import { errorHandler } from '@/src/utils/error';
import { toast } from '@/src/utils/toast';

const onSubmit =
  ({ session, computedColorScheme, onSuccess }: CreateModalProps) =>
  async (values: TaskBaseScheme) => {
    // First we create a new task,
    await errorHandler(
      async () => await toast(
        Task.create(values, session),
        'Creating task...',
        'Task created!',
        'Failed to create task',
        computedColorScheme,
      ),
      computedColorScheme,
    )
    // Then we tell everyone we're done!
    await onSuccess()
  }

export default function CreateTaskForm ({ session, computedColorScheme, onSuccess }: CreateModalProps): JSX.Element {
  const form = useForm({
    mode: 'uncontrolled',
    validateInputOnBlur: true,
    initialValues: {
      title: '',
      description: '',
      complete: false,
      patient_id: 0,
      expertise: null,
    },
    validate: {
      title: notEmptyValidator('Title is required'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit({ session, computedColorScheme, onSuccess }))}>
      <TextInput
        label="Task Title"
        placeholder="Schedule a check-up"
        required
        key={form.key('title')}
        {...form.getInputProps('title')}
      />

      { /* TODO: Custom component that selects an existing patient by name */ }
      <NumberInput
        label="Patient id"
        required
        key={form.key('patient_id')}
        {...form.getInputProps('patient_id')}
      />

      { /* TODO: Check suggest existing fields */ }
      <TextInput
        label="Expertise"
        placeholder="e.g. Eye"
        key={form.key('expertise')}
        {...form.getInputProps('expertise')}
      />

      { /* TODO: support right-to-left automatic detection? Notice, there is a native html attribute for this */ }
      <Textarea
        label="Description"
        placeholder="Patient hurts on his right eye"
        key={form.key('description')}
        {...form.getInputProps('description')}
      />

      <Space h="md" />

      <Checkbox
        label={form.getValues().complete ? 'Complete' : 'Not complete'}
        key={form.key('complete')}
        {...form.getInputProps('complete')}
      />

      <Button type="submit" mt="md">
        Finish
      </Button>
    </form>
  )
}
