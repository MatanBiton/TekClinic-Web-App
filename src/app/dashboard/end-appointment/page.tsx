'use client'


import { useSearchParams, useRouter } from 'next/navigation'
import {
    Button,
    Stack,
    Textarea,
    Title,
} from '@mantine/core'


export default function Page() {
    // Hooks
    const params = useSearchParams()
    const router = useRouter()


    router.prefetch('/dashboard')
    function saveAndExit() {
        console.log("Saving and exiting")
        router.replace('/dashboard')
    }

    const appointment = params.get("appointment")
    const patient = params.get("patient")
    return <Stack>
        <Title>Appointment Summary</Title>
        <Textarea placeholder="Patient's main complaints"/>
        <Textarea placeholder="Conclusions"/>
        {/* This button should only add tasks when after `Save and Exit` has
            been pressed */}
        <Button>Add Follow Up Tasks</Button>
        <Textarea 
            label="Patient's notes"
            placeholder="Notes"
            autosize
            minRows={4}
            maxRows={8}
        />
        <Button onClick={saveAndExit}>Save and Exit</Button>
    </Stack>
}
