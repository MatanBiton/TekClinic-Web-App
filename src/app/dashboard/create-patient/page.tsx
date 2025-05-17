import Link from 'next/link'
import {
    Button,
    Title,
    Stack,
} from '@mantine/core'


export default function CreatePatientPage () {
    return <Stack>
        <Title ta="center">Create a Patient</Title>
        {/* Here we might show the exact same form from the CreatePatient Modal
        */}
        <Link prefetch={true} href={{
            pathname: "/dashboard/create-appointment",
            query: { patient: "test-patient" }
        }}>
            <Button fullWidth>New appointment for a test patient</Button>
        </Link>
    </Stack>
}
