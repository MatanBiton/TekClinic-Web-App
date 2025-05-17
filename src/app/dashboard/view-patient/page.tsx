'use client'


import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
    Button,
    Title,
    Stack,
} from '@mantine/core'


export default function Page() {
    const params = useSearchParams()
    const appointment = params.get("appointment")
    const patient = params.get("patient")
    return <Stack>
        <Title>Appointment for Patient</Title>
        <Title order={4}>Appointment: {appointment}</Title>
        <Title order={4}>Patient: {patient}</Title>
        <Link prefetch={true} href={{
            pathname: "/dashboard/end-appointment",
            query: { patient, appointment }
        }}>
            <Button>End Appointment</Button>
        </Link>
    </Stack>
}
