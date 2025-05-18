'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Button,
    Group,
    Paper,
    Stack,
    Title,
    useComputedColorScheme,
} from '@mantine/core'
import AppointmentSchedule from '@/src/components/AppointmentSchedule'
import { useGuaranteeSession } from '@/src/utils/auth'


function Column(props: { name: string, children: React.ReactNode }) {
    return <Stack
        align="stretch"
        justify="flex-start"
    >
        <Title ta="center" order={4}>{props.name}</Title>
        {props.children}
    </Stack>
}


function dateAddHour(date: Date, hours: number): Date {
    const newDate = new Date(date)
    newDate.setHours(newDate.getHours() + hours)
    return newDate
}


function SelectPatient () {
    const session = useGuaranteeSession()
    const ccs = useComputedColorScheme()
    const router = useRouter()
    return <Stack>
        <Title ta="center">Select a Patient</Title>
        <Group grow align="stretch" justify="flex-start">
            <Column name="With Existing Appointment">
                <Paper
                    shadow="xs"
                    bg="blue"
                    w="100%"
                    pl="xs"
                    pr="xs"
                >
                    <Title order={4} ta="center">Today's Appointments</Title>
                    <AppointmentSchedule
                        date='today'
                        hideDate={true}
                        onClick={async a => router.push(
                            `/dashboard/view-patient?appointment=${a.id}`
                        )}
                    />
                </Paper>
                {/*
                <Link href={{
                    pathname: "/dashboard/view-patient",
                    query: {
                        patient: 'test-patient',
                        appointment: 'test-appointment',
                    }
                }}>
                    <Button fullWidth>Choose test appointment</Button>
                </Link>
                */}
            </Column>
            <Column name="Without an Appointment">
                <Link prefetch={true} href="/dashboard/create-patient">
                    {/* Just for testing */}
                    <Button fullWidth>New patient</Button>
                </Link>
                <Link prefetch={true} href={{
                    pathname: "/dashboard/create-appointment",
                    query: { patient: "test-patient" }
                }}>
                    {/* Just for testing */}
                    <Button fullWidth>Choose an existing patient</Button>
                </Link>
            </Column>
        </Group>
    </Stack>
}


// The main component of the dashboard page
export default function DashboardPage(): JSX.Element {
    return <SelectPatient/>
}
