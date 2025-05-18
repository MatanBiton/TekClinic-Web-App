// src/app/tasks/EditTaskForm.tsx
'use client'

import React, { useState } from 'react' // Added useState
import { Button, TextInput, Textarea, Checkbox, Space, MantineColorScheme, Select } from '@mantine/core' // Removed NumberInput, Added Select
import { useForm } from '@mantine/form'
import { type EditModalProps } from '@/src/components/CustomTable'
import { Task } from '@/src/api/model/task'
import { Patient } from '@/src/api/model/patient'; // Added Patient model
import { type TaskUpdateScheme, type IdHolder } from '@/src/api/scheme' // Add IdHolder to the import from scheme.ts
import { notEmptyValidator } from '@/src/utils/validation'
import { errorHandler } from '@/src/utils/error'
import { toast } from 'react-toastify'; // Import toast from react-toastify
import { getToastOptions } from '@/src/utils/toast'; // Keep this for getToastOptions
import { type Session } from 'next-auth'
import { useQuery } from '@tanstack/react-query'; // Added useQuery
import { putAPIResource } from '@/src/api/common'; // Import from the correct module

interface EditTaskFormProps extends EditModalProps<Task> {
  session: Session
  computedColorScheme: MantineColorScheme
  onSuccess: () => Promise<void>
  item: Task
}

// Define a type for form values to handle patient_id as string for the Select component
interface EditTaskFormValues {
  title: string;
  description: string;
  expertise: string | null;
  patient_id: string | null; // patient_id will be a string from the Select component
  complete: boolean;
}

export default function EditTaskForm (
  {
    session,
    computedColorScheme,
    onSuccess,
    item: initialTask
  }: EditTaskFormProps
): JSX.Element {
  const form = useForm<EditTaskFormValues>({
    mode: 'uncontrolled',
    validateInputOnBlur: true,
    initialValues: {
      title: initialTask.title,
      description: initialTask.description ?? '',
      expertise: initialTask.expertise ?? null,
      // Convert patient_id to string for Select component.
      // Assuming initialTask.patient_id is always a valid number.
      patient_id: initialTask.patient_id.toString(), 
      complete: initialTask.complete
    },
    validate: {
      title: notEmptyValidator('Title is required'),
      patient_id: (value) => (value === null ? 'Patient is required' : null), // Validation for Select
    }
  })

  const [patientSearchValue, setPatientSearchValue] = useState<string | undefined>(undefined);

  const { data: patientOptions, isLoading: patientLoading } = useQuery({
    queryKey: ['patients', 'search', patientSearchValue, 'edit-form'], // Added unique part to queryKey
    queryFn: async () => {
      const { items: patients } = await Patient.get({ search: patientSearchValue }, session);
      return patients.map((patient) => ({
        value: patient.id.toString(),
        label: patient.name,
      }));
    },
  });

  async function handleSubmit (values: EditTaskFormValues): Promise<void> {
    // parse and validate patient_id
    let parsedPatientIdAsNumber: number | undefined;
    if (values.patient_id !== null) { 
      parsedPatientIdAsNumber = parseInt(values.patient_id, 10);
      if (isNaN(parsedPatientIdAsNumber)) {
        toast.error('Invalid patient selection.', getToastOptions(computedColorScheme));
        return;
      }
    } else {
      toast.error('Patient is required.', getToastOptions(computedColorScheme));
      return;
    }

    // Instead of updating initialTask properties and calling its update method,
    // construct a complete payload and send it directly
    const updateData: TaskUpdateScheme = {
      title: values.title,
      description: values.description || '',
      expertise: values.expertise || '',
      patient_id: parsedPatientIdAsNumber,
      complete: values.complete
    };
    
    // For debugging - log the payload to ensure it contains all values
    console.log('Task update payload:', updateData);

    await errorHandler(async () => {
      await toast.promise(
        // Fixed: Use the Task class instead of the string 'tasks'
        putAPIResource<IdHolder, TaskUpdateScheme>(Task, initialTask.id, updateData, session),
        {
          pending: 'Updating task…',
          success: 'Task updated successfully!',
          error: 'Error updating task.',
        },
        getToastOptions(computedColorScheme)
      );
      await onSuccess();
    }, computedColorScheme);
  }

  // TODO: Replace this with your actual list of doctor expertises
  // This could be fetched from an API or defined as a constant
  const expertiseOptions = [
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Ophthalmology', label: 'Ophthalmology' },
    // Add other expertises here
  ];

  return (
    <form
      onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
    >
      <TextInput
        label="Task Title"
        placeholder="e.g. Schedule follow-up"
        withAsterisk
        key={form.key('title')}
        {...form.getInputProps('title')}
      />

      {/* Replace NumberInput with Select for patient_id */}
      <Select
        label="Patient"
        placeholder="Select a patient"
        required
        searchable
        onSearchChange={setPatientSearchValue}
        searchValue={patientSearchValue}
        data={patientOptions || []}
        disabled={patientLoading}
        nothingFoundMessage={patientLoading ? "Loading..." : "No patients found"}
        key={form.key('patient_id')}
        {...form.getInputProps('patient_id')}
      />

      <Select
        label="Expertise"
        placeholder="Select expertise"
        data={expertiseOptions}
        key={form.key('expertise')}
        {...form.getInputProps('expertise')}
        // Add 'searchable' if you want the dropdown to be searchable
        // searchable
        // Add 'required' if expertise is a mandatory field
        // required
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
