import { useEffect, useState } from 'react';
import {
    Title,
    Stack,
    Text,
    useComputedColorScheme,
} from '@mantine/core';
import { Appointment } from '@/src/api/model/appointment';
import AppointmentLine, { AppointmentLineStyle } from '@/src/components/AppointmentLine'
import { useGuaranteeSession } from '@/src/utils/auth';
import { errorHandler } from '@/src/utils/error';


export default function AppointmentSchedule(
    props: {
        date?: Date | 'today', // This might change
        doctor_id?: number,
        patient_id?: number,
        onClick?: (_: Appointment) => Promise<void>,
    // Maybe we can just infer these next properties automatically but whatever
    } & AppointmentLineStyle
) {
    const session = useGuaranteeSession();
    const ccs = useComputedColorScheme();
    const date = props.date === 'today' ? new Date() : props.date;

    // Get an array of appointments for the given date
    // TODO: Does this actually return every appointment, or is it limited to
    // some upper count?
    const [appointments, setAppointments] = useState<Appointment[] | 'loading'>('loading');
    useEffect(() => {
        errorHandler(async () => {
            const { items } = await Appointment.get({
                date,
                doctor_id: props.doctor_id,
                patient_id: props.patient_id,
            }, session);
            setAppointments(items);
        }, ccs)
    }, [session])

    return (
        <Stack gap="xs">
            <Title
            order={5}
            mb="md"
            style={{
                borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
                paddingBottom: '0.25rem',}}> Appointments
            </Title>

            { appointments === 'loading'
                ? <Text>Loading...</Text>
                : <>{...appointments.map(appointment => {
                    const onClick = () =>
                        props.onClick
                            ? props.onClick(appointment)
                            : Promise.resolve()
                    return <AppointmentLine
                        {...props}
                        appointment={appointment}
                        onClick={onClick}
                    />
                })}</>
            }
        </Stack>
    );
}
