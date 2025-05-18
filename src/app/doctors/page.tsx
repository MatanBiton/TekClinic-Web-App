'use client'

import React from 'react'
import { Avatar, Badge, Box, Flex, Group, Stack, Text, useComputedColorScheme } from '@mantine/core'
import CustomTable from '@/src/components/CustomTable'
import PhoneNumber from '@/src/components/PhoneNumber'
import { buildDeleteModal } from '@/src/utils/modals'
import { modals } from '@mantine/modals'
import { Doctor } from '@/src/api/model/doctor'
import CreateDoctorForm from '@/src/app/doctors/CreateDoctorForm'
import EditDoctorForm from './EditDoctorForm'
import male_avatar from '@/public/male-patient.webp'
import female_avatar from '@/public/female-patient.webp'
import unknown_avatar from '@/public/unknown-patient.webp'
import AppointmentSchedule from '@/src/components/AppointmentSchedule'


function DoctorPage (): React.JSX.Element {
  const computedColorScheme = useComputedColorScheme()

  return (
    <CustomTable
      dataName='Doctor'
      storeColumnKey='doctor-columns'
      queryOptions={(session, page, pageSize) => ({
        queryKey: ['doctors', page, pageSize],
        queryFn: async () => {
          return await Doctor.get({
            skip: pageSize * (page - 1),
            limit: pageSize
          }, session)
        }
      })}
      showDeleteModal={buildDeleteModal('doctor', (doctor) => doctor.name)}
      showCreateModal={({
        session,
        computedColorScheme,
        onSuccess
      }) => {
        // Generate some random modal id
        const modalId = 'create-doctor-modal'
        modals.open({
          modalId,
          title: 'Doctor Information',
          children:
            <CreateDoctorForm
              session={session}
              computedColorScheme={computedColorScheme}
              onSuccess={async () => {
                modals.close(modalId)
                await onSuccess()
              }}
            />
        })
      }}
      showEditModal={({
        item,
        session,
        computedColorScheme,
        onSuccess
      }) => {
        // Generate some random modal id
        const modalId = 'edit-doctor-modal'
        modals.open({
          modalId,
          title: 'Edit Doctor Information',
          children:
            <EditDoctorForm
              item={item}
              session={session}
              computedColorScheme={computedColorScheme}
              onSuccess={async () => {
                modals.close(modalId)
                await onSuccess()
              }}
            />
        })
      }}
      showViewModal={
        ({
          item,
          computedColorScheme
        }) => {
          const doctor = item
          modals.open({
            title: 'Doctor Information',
            centered: true,
            children: (
              <Group align="flex-start">
                <Avatar size={120} radius="120px"
                        src={doctor.gender === 'male' ? male_avatar.src : doctor.gender === 'female' ? female_avatar.src : unknown_avatar.src}
                        alt="Patient photo"/>
                <Stack>
                  <Box>
                    <Text><strong>Name:</strong> {doctor.name}</Text>
                    <Text><strong>Active:</strong> {doctor.active}</Text>
                    <Text><strong>Gender:</strong> {doctor.gender}</Text>
                    {doctor.phone_number !== null && <Text><strong>Phone:</strong> <PhoneNumber number={doctor.phone_number}/></Text>}
                    <Text><strong>Specialities:</strong></Text>

                    {doctor.specialities.map((spec) => (
                        <Badge key={spec} variant="gradient" gradient={{
                          from: (computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c'),
                          to: (computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c'),
                          deg: 90
                        }} style={{ color: computedColorScheme === 'light' ? 'black' : 'white' }}>
                          {spec}
                        </Badge>
                    )
                    )}

                    {doctor.special_note !== null && <Text><strong>Special Note:</strong> {doctor.special_note}</Text>}
                  </Box>
                  <AppointmentSchedule
                    doctor_id={doctor.id}
                    hideDoctor
                  />
                </Stack>
              </Group>
            )
          })
        }
      }
      columns={[
        {
          title: '#',
          accessor: 'id',
          toggleable: false,
          draggable: false,
          resizable: false
        },
        {
          accessor: 'name'
        },
        {
          accessor: 'active',
          render: (doctor: Doctor) => doctor.active ? 'Active' : 'Inactive'
        },
        {
          accessor: 'gender',
          render: (doctor: Doctor) => {
            let color = 'gray'
            if (doctor.gender === 'male') {
              color = 'blue'
            } else if (doctor.gender === 'female') {
              color = 'pink'
            }
            return <Badge color={color}>{doctor.gender}</Badge>
          }
        },
        {
          accessor: 'phone_number',
          render: (doctor: Doctor) => {
            return doctor.phone_number == null ? '' : <PhoneNumber number={doctor.phone_number} />
          }
        },
        {
          accessor: 'specialities',
          render:
            (doctor: Doctor) => (
              <Flex style={{ margin: '2px' }} direction='column' gap='10px'>
                {doctor.specialities.map((speciality) => (
                    <Badge key={speciality} variant="gradient" gradient={{
                      from: computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c',
                      to: computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c',
                      deg: 90
                    }} style={{ color: computedColorScheme === 'light' ? 'black' : 'white' }}>
                      {speciality}
                    </Badge>
                )
                )}
              </Flex>
            )
        },
        {
          accessor: 'special_note'
        }
      ]}
    />
  )
}

export default DoctorPage
