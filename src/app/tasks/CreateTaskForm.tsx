import React, { useState } from 'react'
import { Button, Checkbox, MantineColorScheme, NumberInput, Space, Textarea, TextInput, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { CreateModalProps } from '@/src/components/CustomTable'
import { notEmptyValidator } from '@/src/utils/validation';
import { Task } from '@/src/api/model/task';
import { TaskBaseScheme } from '@/src/api/scheme';
import { errorHandler } from '@/src/utils/error';
import { Patient } from '@/src/api/model/patient';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getToastOptions } from '@/src/utils/toast';

const onSubmit =
  ({ session, computedColorScheme, onSuccess }: CreateModalProps) =>
  async (values: {
    title: string;
    description: string;
    complete: boolean;
    patient_id: string | null; 
    expertise: string | null;
  }) => {
    const result = await errorHandler(async () => {
      await toast.promise(
        Task.create(
          {
            ...values,
            // Assuming validation ensures patient_id is a non-null string here.
            // parseInt will return NaN if patient_id is not a parsable integer string,
            // or if patient_id were null (parseInt(null!, 10) -> NaN).
            // NaN is of type number, satisfying the likely requirement that patient_id be a number.
            patient_id: parseInt(values.patient_id!, 10), 
          },
          session
        ),
        {
          pending: `Creating task ${values.title}...`,
          success: `Task ${values.title} was created successfully.`,
          error: 'Error while creating task...',
        },
        getToastOptions(computedColorScheme)
      );
    }, computedColorScheme);
    if (result instanceof Error) {
      return;
    }
    await onSuccess();
  };

export default function CreateTaskForm ({ session, computedColorScheme, onSuccess }: CreateModalProps): JSX.Element {
  const form = useForm({
    mode: 'uncontrolled',
    validateInputOnBlur: true,
    initialValues: {
      title: '',
      description: '',
      complete: false,
      patient_id: null,
      expertise: null,
    },
    validate: {
      title: notEmptyValidator('Title is required'),
      patient_id: (value) => (value == null ? 'Patient is required' : null), // Validation for Select
      // Optional: Add validation for expertise if it becomes required
      // expertise: (value) => (value == null ? 'Expertise is required' : null),
    },
  });

  const [patientSearchValue, setPatientSearchValue] = useState<string | undefined>(undefined);

  const { data: patientOptions, isLoading: patientLoading } = useQuery({
    queryKey: ['patients', 'search', patientSearchValue],
    queryFn: async () => {
      const { items: patients } = await Patient.get({ search: patientSearchValue }, session);
      return patients.map((patient) => ({
        value: patient.id.toString(),
        label: patient.name,
      }));
    },
  });

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
    <form onSubmit={form.onSubmit(onSubmit({ session, computedColorScheme, onSuccess }))}>
      <TextInput
        label="Task Title"
        placeholder="Schedule a check-up"
        required
        key={form.key('title')}
        {...form.getInputProps('title')}
      />

      { /* TODO: Custom component that selects an existing patient by name */ }
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
