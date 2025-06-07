import React from 'react'
import { type Session } from 'next-auth'
import {
  Avatar,
  Box,
  Divider,
  Group,
  Text,
  Stack,
  Paper,
  Title,
  Badge,
  type MantineColorScheme,
} from '@mantine/core'
import { type Patient } from '@/src/api/model/patient'
import male_avatar from '@/public/male-patient.webp'
import female_avatar from '@/public/female-patient.webp'
import unknown_avatar from '@/public/unknown-patient.webp'
import { Appointment } from '@/src/api/model/appointment'
import { Task } from '@/src/api/model/task'
import PhoneNumber from '@/src/components/PhoneNumber'
import Languages from '@/src/components/Languages'
import AppointmentSchedule from '@/src/components/AppointmentSchedule'
import TaskSchedule from '@/src/components/TaskSchedule'


async function loadPatientAppointments(
  patientId: number,
  session: Session
): Promise<Appointment[]> {
  const { items: appointments } = await Appointment.get(
    { patient_id: patientId },
    session
  )
  return appointments
}

async function loadPatientTasks(
  patientId: number,
  session: Session
): Promise<Task[]> {
  const response = await Task.getByPatientId(patientId, session)
  return response
}

function padTwoDigits(num: number): string {
  return num.toString().padStart(2, '0')
}

const AppointmentDate: React.FC<{ date: Date }> = ({ date }) =>
  `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(
    date.getDate()
  )}`

const AppointmentTime: React.FC<{ date: Date }> = ({ date }) =>
  `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}`

const ViewAppointment: React.FC<{ appointment: Appointment; session: Session }> = ({
  appointment,
  session,
}) => {
  const [doctorName, setDoctorName] = React.useState<string | null>(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    appointment
      .loadDoctor(session)
      .then(() => setDoctorName(appointment.getDoctorName()))
      .catch(() => setError(true))
  }, [appointment, session])

  const { start_time: startTime, end_time: endTime } = appointment

  // Paper is like a div with a shadow and a border.
  // TODO: What if the end_timee is on a different day?
  return <Paper
    shadow="md"
    mb="xs"
    bg="green"
    w="100%"
    display="inline-block"
    pl="xs"
    pr="xs"
    c="black"
  >
    <Group>
      <AppointmentDate date={startTime} /> <AppointmentTime date={startTime} />-<AppointmentTime date={endTime} />:
      <Text m="auto">
        {doctorName ?? (error ? 'Could not load doctor' : 'Loading name...')}
      </Text>
    </Group>
  </Paper>
}

interface ViewPatientProps {
  computedColorScheme: MantineColorScheme
  patient: Patient
  session: Session
}

const ViewPatient: React.FC<ViewPatientProps> = ({
  session,
  computedColorScheme,
  patient,
}) => (
  <Box>
    <Group align="flex-start">
      <Avatar
        size={120}
        radius="120px"
        src={
          patient.gender === 'male'
            ? male_avatar.src
            : patient.gender === 'female'
            ? female_avatar.src
            : unknown_avatar.src
        }
        alt="Patient photo"
      />
      <Stack>
        <Box>
          <Text>
            <strong>Name:</strong> {patient.name}
          </Text>
          <Text>
            <strong>Age:</strong> {patient.age}
          </Text>
          <Text>
            <strong>Gender:</strong> {patient.gender}
          </Text>
          {patient.phone_number !== undefined && (
            <Text>
              <strong>Phone:</strong> <PhoneNumber number={patient.phone_number} />
            </Text>
          )}
          <Text>
            <strong>Birth Date:</strong> {patient.birth_date.toLocaleDateString()}
          </Text>

          <Text>
            <strong>Languages:</strong>
          </Text>
          <Languages languages={patient.languages} />

          {patient.referred_by !== null && (
            <Text>
              <strong>Referred By:</strong> {patient.referred_by}
            </Text>
          )}
          {patient.special_note !== null && (
            <Text>
              <strong>Special Note:</strong> {patient.special_note}
            </Text>
          )}
        </Box>

        {patient.emergency_contacts.length !== 0 && <Divider my="sm" />}

        <Box>
          {patient.emergency_contacts.length !== 0 && (
            <Text>
              <strong>Emergency Contacts:</strong>
            </Text>
          )}
          <Stack>
            {patient.emergency_contacts.map((contact, idx) => (
              <Box key={idx}>
                <Text>
                  <strong>Name:</strong> {contact.name}
                </Text>
                <Text>
                  <strong>Relation:</strong> {contact.closeness}
                </Text>
                <Text>
                  <strong>Phone:</strong> {contact.phone}
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Group>

    <Divider my="sm" />

   {/* Tasks go first */}
    <TaskSchedule patient_id={patient.id} />
    <Divider my="sm" />

    {/* Then appointments */}
    <AppointmentSchedule
      patient_id={patient.id}
      hidePatient
    />
  </Box>
)

export default ViewPatient
