'use client'


import Link from 'next/link'
import { useSearchParams } from 'next/navigation';
import {
    Button,
    Title,
    Stack,
} from '@mantine/core'


export default function Page () {
    const params = useSearchParams();
    const patient = params.get("patient");
    return <Stack>
        <Title ta="center">Create an Appointment for {patient}</Title>
        <Link prefetch={true} href={{
            pathname: "/dashboard/view-patient",
            query: { patient, appointment: "test-appointment" }
        }}>
            <Button fullWidth>New appointment for a test patient</Button>
        </Link>
    </Stack>
}
