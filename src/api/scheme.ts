// Definition of the data scheme according to the API

/*
 * Every object such as Patient, Doctor, Appointment, Task, etc. has a base
 * scheme, regular scheme and an update scheme. The base scheme is used for
 * creating new objects and the regular scheme is for reading, and the update
 * scheme is for updating.
 */

export interface NamedAPIResourceList {
  count: number
  next: null | string
  previous: null | string
  results: NamedAPIResource[]
}

export interface NamedAPIResource {
  name: string
  id: number
}

export interface PatientBaseScheme {
  name: string
  personal_id: PersonalId
  gender?: Gender
  phone_number?: string
  languages?: string[]
  birth_date: string
  emergency_contacts?: EmergencyContact[]
  referred_by?: string
  special_note?: string
}

export interface PatientScheme extends PatientBaseScheme {
  id: number
  active: boolean
  age: number
  gender: Gender
  languages: string[]
  emergency_contacts: EmergencyContact[]
}

export interface PatientUpdateScheme extends PatientBaseScheme {
  active: boolean
}

export interface PersonalId {
  id: string
  type: string
}

export interface EmergencyContact {
  name: string
  closeness: string
  phone: string
}

export interface DoctorBaseScheme {
  name: string
  gender?: Gender
  phone_number: string
  specialities?: string[]
  special_note?: string
}

export interface DoctorScheme extends DoctorBaseScheme {
  id: number
  active: boolean
  gender: Gender
  specialities: string[]
}

export interface DoctorUpdateScheme extends DoctorBaseScheme {
  active: boolean
}

export interface AppointmentBaseScheme {
  patient_id?: number
  doctor_id: number
  start_time: string
  end_time: string
}

export interface AppointmentScheme extends AppointmentBaseScheme {
  id: number
  approved_by_patient: boolean
  visited: boolean
}

export interface AppointmentUpdateScheme extends AppointmentBaseScheme {
  approved_by_patient: boolean
  visited: boolean
}

export interface TaskBaseScheme {
  patient_id: number
  expertise: string | null
  title: string
  description: string
}

export interface TaskScheme extends TaskBaseScheme {
  id: number
  created_at: string
  complete: boolean
}

export interface TaskUpdateScheme extends TaskBaseScheme {
  complete: boolean
}

export interface IdHolder {
  id: number
}

export interface PatientIdHolder {
  patient_id: number
}

export type Gender = 'unspecified' | 'male' | 'female'
