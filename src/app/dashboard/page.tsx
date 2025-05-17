'use client'

import React from 'react'
import Link from 'next/link'
import {
    Title,
    Group, Stack, Button } from '@mantine/core'


function Column(props: { name: string, children: React.ReactNode }) {
    return <Stack
        align="stretch"
        justify="flex-start"
    >
        <Title ta="center" order={4}>{props.name}</Title>
        {props.children}
    </Stack>
}


function SelectPatient () {
    return <Stack>
        <Title ta="center">Select a Patient</Title>
        <Group grow align="stretch" justify="flex-start">
            <Column name="With Existing Appointment">
                <Link prefetch={true} href={{
                    pathname: "/dashboard/view-patient",
                    query: {
                        patient: 'test-patient',
                        appointment: 'test-appointment',
                    }
                }}>
                    {/* Just for testing */}
                    <Button fullWidth>Choose test appointment</Button>
                </Link>
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
