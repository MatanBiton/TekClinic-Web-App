'use client'

import React from 'react'
import { format } from 'date-fns'
import { Patient } from '@/src/api/model/patient'
import { Badge, Flex, useComputedColorScheme, Stack, Title, Divider } from '@mantine/core'
import CustomTable from '@/src/components/CustomTable'
import PhoneNumber from '@/src/components/PhoneNumber'
import {Task} from "@/src/api/model/task";
import {Appointment} from "@/src/api/model/appointment";


function getTaskColumns(computedColorScheme: string) {
  return [
      { title: '#', accessor: 'id' },
    { title: 'Title', accessor: 'title' },
    { title: 'Expertise', accessor: 'expertise' },
    { title: 'Patient', accessor: 'patient_id' }
  ]
}

function getAppointmentsColumns(computedColorScheme: string) {
    return [
        { title: '#', accessor: 'id' },
        {
            title: 'Patient',
            accessor: 'patient_id',
            render: (row: Appointment) => row.getPatientName() ?? 'Unknown'
        },
        {
            title: 'Doctor',
            accessor: 'doctor_id',
            render: (row: Appointment) => row.getDoctorName() ?? 'Unknown'
        },
        {
            title: 'Time',
            accessor: 'time_range',
            render: (row: Appointment) =>
                `${format(row.start_time, 'HH:mm')} - ${format(row.end_time, 'HH:mm')}`
        }
    ]
}



function renderTodayTasks(label: string, keySuffix: string, computedColorScheme: string){
  return <CustomTable<Task>
      dataName={label}
      storeColumnKey={`summary-columns-${keySuffix}`}
      queryOptions={(session, page, pageSize) => ({
        queryKey: ['tasks', keySuffix, page, pageSize],
        queryFn: async (_ctx) => {
          const result =  await Task.get(
              {
                skip: pageSize * (page - 1)
              },
              session
          )

            // Today's date range
            const todayISO = new Date().toISOString().slice(0, 10);

            // Filter client-side
            const filteredTasks = result.items.filter((task: Task) => {
                const taskDate = new Date(task.created_at).toISOString().slice(0, 10);
                return taskDate === todayISO;
            });

            return {
                items: filteredTasks,
                count: filteredTasks.length // optional, if your CustomTable needs it
            };
        }
      })}
      columns={getTaskColumns(computedColorScheme)}
  />
}

// function renderTodayAppointments(label: string, keySuffix: string, computedColorScheme: string){
//     return <CustomTable<Appointment>
//         dataName={label}
//         storeColumnKey={`summary-columns-${keySuffix}`}
//         queryOptions={(session, page, pageSize) => ({
//             queryKey: ['appointments', keySuffix, page, pageSize],
//             queryFn: async (_ctx) => {
//                 const result =  await Appointment.get(
//                     {
//                         skip: pageSize * (page - 1)
//                     },
//                     session
//                 )
//
//                 // Today's date range
//                 const todayISO = new Date().toISOString().slice(0, 10);
//
//                 // Filter client-side
//                 const filteredApps = result.items.filter((appointment: Appointment) => {
//                     const appDate = new Date(appointment.start_time).toISOString().slice(0, 10);
//                     return appDate === todayISO;
//                 });
//
//                 return {
//                     items: filteredApps,
//                     count: filteredApps.length // optional, if your CustomTable needs it
//                 };
//             }
//         })}
//         columns={getAppointmentsColumns(computedColorScheme)}
//     />
// }

function renderTodayAppointments(label: string, keySuffix: string, computedColorScheme: string) {
    return (
        <CustomTable<Appointment>
            dataName={label}
            storeColumnKey={``}
            queryOptions={(session, page, pageSize) => ({
                queryKey: ['appointments', keySuffix, page, pageSize],
                queryFn: async (_ctx) => {
                    const result = await Appointment.get(
                        {
                            skip: pageSize * (page - 1),
                        },
                        session
                    );

                    const todayISO = new Date().toISOString().slice(0, 10);

                    // Filter appointments to today's only
                    const filteredAppointments = result.items.filter((appointment: Appointment) => {
                        const appDate = new Date(appointment.start_time).toISOString().slice(0, 10);
                        return appDate === todayISO;
                    });

                    // Load doctor and patient details in parallel
                    await Promise.all(
                        filteredAppointments.map(async (appointment) => {
                            await Promise.all([
                                appointment.loadDoctor(session),
                                appointment.loadPatient(session)
                            ]);
                        })
                    );

                    return {
                        items: filteredAppointments,
                        count: filteredAppointments.length
                    };
                },
            })}
            columns={getAppointmentsColumns(computedColorScheme)}
        />
    );
}

function summaryPage (): React.JSX.Element {
  const computedColorScheme = useComputedColorScheme()

  return (
      <Stack gap="xl">
        <Title order={3} fw={700} size="h2">{"Today's Tasks"}</Title>
        {renderTodayTasks("Today's Tasks", 'a', computedColorScheme)}
        <Divider my="md" size="lg" />
          <Title order={3} fw={700} size="h2">{"Today's Appointments"}</Title>
        {renderTodayAppointments("Today's Appointments", 'b', computedColorScheme)}
      </Stack>
  )
}

export default summaryPage
