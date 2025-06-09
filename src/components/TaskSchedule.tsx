import { useState, useEffect } from 'react'
import {
  Title,
  Stack,
  Text,
  Paper,
  Badge,
  Divider,
  Group,
  useComputedColorScheme,
} from '@mantine/core'
import { useGuaranteeSession } from '@/src/utils/auth'
import { errorHandler } from '@/src/utils/error'
import { Task } from '@/src/api/model/task'

interface TaskScheduleProps {
  patient_id: number
}

export default function TaskSchedule({ patient_id }: TaskScheduleProps) {
  const session = useGuaranteeSession()
  const ccs = useComputedColorScheme()
  const [tasks, setTasks] = useState<Task[] | 'loading'>('loading')

  useEffect(() => {
    errorHandler(async () => {
      try {
        // now returns Task[]
        const tasks = await Task.getByPatientId(patient_id, session)
        setTasks(tasks)
      } catch {
        // if the call errors (e.g. no tasks) → show "No tasks found"
        setTasks([])
      }
    }, ccs)
  }, [patient_id, session])

  return (
    <Stack gap="xs">
      <Title
        order={5}
        mb="md"
        style={{
          borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
          paddingBottom: '0.25rem',
        }}
      >
        Tasks
      </Title>

      {tasks === 'loading' && <Text>Loading tasks...</Text>}
      {tasks !== 'loading' && tasks.length === 0 && <Text>No tasks found.</Text>}

      {tasks !== 'loading' &&
        tasks.map((task) => (
          <Paper
            key={task.id}
            shadow="xs"
            p="md"
            withBorder
            style={{ marginBottom: 8 }}
          >
            <Group
              align="flex-start"
              style={{ justifyContent: 'space-between', marginBottom: 8 }}
            >
              <Text style={{ fontSize: '1.125rem', fontWeight: 500 }}>
                {task.title}
              </Text>
              <Badge color={task.complete ? 'green' : 'gray'}>
                {task.complete ? 'Complete' : 'Incomplete'}
              </Badge>
            </Group>
            {task.description && (
              <Text
                style={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                }}
              >
                {task.description}
              </Text>
            )}
            <Divider />
          </Paper>
        ))}
    </Stack>
  )
}
