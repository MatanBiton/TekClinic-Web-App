import React, { useEffect, useState } from 'react'
import {
    Button,
    Group,
    Text,
    useComputedColorScheme
} from '@mantine/core'
import { Appointment } from '@/src/api/model/appointment'
import Date from '@/src/components/Date'
import TimeRange from '@/src/components/TimeRange'
import { useGuaranteeSession } from '@/src/utils/auth'
import { errorHandler } from '@/src/utils/error'


export interface AppointmentLineStyle {
    hideDate?: boolean
    hideTime?: boolean
    hideDoctor?: boolean
    hidePatient?: boolean
}


function If(props: { cond: boolean, children: React.ReactNode }) {
    return props.cond ? <>{props.children}</> : null
}


// TODO: Add color based on the doctor... or something.
function AppointmentLine(
    {
        appointment,
        onClick,
        hideDate,
        hideTime,
        hideDoctor,
        hidePatient,
    }: {
        appointment: Appointment,
        onClick?: () => Promise<void>,
    } & AppointmentLineStyle
) {
    const session = useGuaranteeSession();
    const ccs = useComputedColorScheme()
    const { start_time: startTime, end_time: endTime } = appointment

    const [doctorName, setDoctorName] = useState<string | null>(null)
    const [patientName, setPatientName] = useState<string | null>(null)

    // Need to load the doctor and patient to read it's name.
    useEffect(() => {
        errorHandler(async () => {
            await Promise.all([
                appointment.loadDoctor(session).then(() => {
                    setDoctorName(appointment.getDoctorName())
                }),
                appointment.loadPatient(session).then(() => {
                    setPatientName(appointment.getPatientName())
                }),
            ])
        }, ccs)
    }, [appointment, session])

    // Paper is like a div with a shadow and a border.
    // TODO: What if the end_timee is on a different day?
    // return <Paper
    //     shadow="md"
    //     mb="xs"
    //     bg="green"
    //     w="100%"
    //     display="inline-block"
    //     pl="xs"
    //     pr="xs"
    //     c="black"
    // >
    return (
        <Button
            fullWidth
            variant="subtle"
            size="compact-md"
            onClick={() => onClick ? onClick() : Promise.resolve()}>
        <Group>
            <If cond={!hideDate}><Date date={startTime} /></If>
            <If cond={!hideTime}>
                <TimeRange start={{date: startTime}} end={{date: endTime}}/>
            </If>
            <If cond={!hideDoctor}>
                <Text c="white" fw="bold" m="auto">
                    {doctorName ?? 'Loading doctor...'}
                </Text>
            </If>
            <If cond={!hidePatient}>
                <Text c="white" fw="bold" m="auto">
                    {patientName ?? 'Loading patient...'}
                </Text>
            </If>
        </Group>
        </Button>
    )
}


export default AppointmentLine
