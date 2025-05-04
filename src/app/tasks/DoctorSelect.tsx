// This file is work that for some reason we did not need again but might need
// later.
/***
'use client'

import React, { useEffect, useState } from 'react'
import { Box, Select } from '@mantine/core'
import { type Session } from 'next-auth'
import { Doctor } from '@/src/api/model/doctor'

interface DoctorSelectProps {
  /** The currently selected doctor name or ID (we’ll store doc.name for now). 
  value: string
  /** Called when user picks a new doctor. 
  onChange: (newValue: string) => void
  /** Session so we can fetch from the microservice. 
  session: Session
}
    ***/
/**
 * A simplified DoctorSelect that:
 *  - Fetches all doctors at once using `Doctor.getAllDoctors(session)`
 *  - Provides a searchable Mantine Select
 *  - As you type, Mantine auto-filters the list
 *  - No "filter by profession" logic
 
export function DoctorSelect ({
  value,
  onChange,
  session
}: DoctorSelectProps): JSX.Element {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  // We need local state for the user’s typed search so Mantine can let you type
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const allDocs = await Doctor.getAllDoctors(session)
      setDoctors(allDocs)
      setLoading(false)
    })()
  }, [session])

  // Convert the list of doctors into the <Select> data format
  const selectData = doctors.map((doc) => ({
    value: doc.name, // or doc.id.toString() if you prefer
    label: doc.name
  }))

  return (
    <Box>
      <Select
        label="Doctor"
        placeholder="e.g. Dr. Alice"
        searchable
        clearable
        withAsterisk

        // The current chosen value
        value={value}
        // Whether user can type
        searchValue={searchValue}
        // Called each time user types
        onSearchChange={setSearchValue}
        disabled={loading}

        // Called when user picks from the dropdown
        onChange={(val) => {
          if (val != null) onChange(val)
          else onChange('')
        }}
        data={selectData}
      />
    </Box>
  )
}
*/
