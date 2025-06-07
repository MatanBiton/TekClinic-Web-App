import { type Session } from 'next-auth'
import axios from 'axios'
import { requireBuildEnv } from '@/src/utils/env'
import { type IdHolder, type NamedAPIResource, type NamedAPIResourceList, type PatientIdHolder } from '@/src/api/scheme'
import { wrapError } from '@/src/api/error'
import { phone } from 'phone'
import { QueryClient } from '@tanstack/react-query'
import React from 'react'
import { type Task } from '@/src/api/model/task'
import { type Appointment } from '@/src/api/model/appointment'

// url of the API
const API_URL = requireBuildEnv('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL)
// time in milliseconds for the cache to be considered stale
const STALE_TIME = 1000 * 60
// maximum number of items per page in paginated API queries
export const MAX_ITEMS_PER_PAGE = 50

// Class object of API resources has to implement this interface to be used in the API functions.
// __name__ is the name of the resource in the API. For example, if Patient's API endpoint is 'API_URL/patient',
// then __name__ should be 'patient'.
interface ApiResourceClass {
  __name__: string
}

// Class object of API resources has to implement this interface to support fetching from the API.
// Scheme is the data scheme according to the API.
// fromScheme is a static method that creates an instance of the resource from the scheme.
interface FetchableAPIResourceClass<Scheme> extends ApiResourceClass {
  new (...args: any[]): any

  fromScheme: (scheme: Scheme) => InstanceType<this>
}

// PaginationResult represents the result of a paginated API query.
export interface PaginationResult<T> {
  items: T[]
  count: number
}

// Base interface for pagination query parameters.
export interface PaginationParams {
  skip?: number
  limit?: number
}

// formatPaginationParams formats pagination query parameters. Endpoint query parameters has to be formatted as strings.
export const formatPaginationParams = (
  params: PaginationParams
): Record<string, string> => {
  const formattedParams: Record<string, string> = {}
  if (params.skip != null) {
    formattedParams.skip = params.skip.toString()
  }
  if (params.limit != null) {
    formattedParams.limit = params.limit.toString()
  }
  return formattedParams
}

// authHeader return the authorization headers for API requests.
// session is the session object from next-auth.
const authHeader = (
  session: Session
): { Authorization: string } => ({
  Authorization: `Bearer ${session.accessToken}`
})

// apiGET makes API GET requests. Wraps error handling and response data extraction.
// T is the response data type.
// url is the API endpoint.
// session is the session object from next-auth.
export const apiGET = async <T> (
  url: string,
  session: Session
): Promise<T> => {
  try {
    const response = await axios.get<T>(url, {
      headers: authHeader(session)
    })
    return response.data
  } catch (error) {
    throw wrapError(error)
  }
}

// apiPOST makes API POST requests. Wraps error handling and response data extraction.
// T is the response data type, V is the request data type.
// url is the API endpoint.
// session is the session object from next-auth.
// data is the request data.
export const apiPOST = async <T, V> (
  url: string,
  session: Session,
  data: V
): Promise<T> => {
  try {
    const response = await axios.post<T>(url, data, {
      headers: authHeader(session)
    })
    return response.data
  } catch (error) {
    throw wrapError(error)
  }
}

// apiDELETE makes API DELETE requests. Wraps error handling and response data extraction.
// T is the response data type.
// url is the API endpoint.
// session is the session object from next-auth.
export const apiDELETE = async <T> (
  url: string,
  session: Session
): Promise<T> => {
  try {
    const response = await axios.delete<T>(url, {
      headers: authHeader(session)
    })
    return response.data
  } catch (error) {
    throw wrapError(error)
  }
}

// apiPUT makes API PUT requests. Wraps error handling and response data extraction.
// T is the response data type, V is the request data type.
// url is the API endpoint.
// session is the session object from next-auth.
// data is the request data.
export const apiPUT = async <T, V> (
  url: string,
  session: Session,
  data: V
): Promise<T> => {
  try {
    const response = await axios.put<T>(url, data, {
      headers: authHeader(session)
    })
    return response.data
  } catch (error) {
    throw wrapError(error)
  }
}

// getAPIResource fetches a single resource from the API.
// Scheme is the data scheme according to the API.
// resourceClass is the class object of the resource.
// id is the ID of the resource.
// session is the session object from next-auth.
// Returns the resource instance.
export const getAPIResource = async <Scheme> (
  resourceClass: FetchableAPIResourceClass<Scheme>,
  id: number,
  session: Session
): Promise<InstanceType<FetchableAPIResourceClass<Scheme>>> => {
  const data = await queryClient.fetchQuery({
    queryKey: [resourceClass.__name__, id],
    queryFn: async () => {
      return await apiGET<Scheme>(`${API_URL}/${resourceClass.__name__}/${id}`, session)
    }
  })
  return resourceClass.fromScheme(data)
}

// getAPIResourceList fetches a list of resources from the API.
// Scheme is the data scheme according to the API.
// resourceClass is the class object of the resource.
// params is the query parameters for the API endpoint.
// session is the session object from next-auth.
// Returns the list of resources and the total count of resources.
export const getAPIResourceList = async <Scheme> (
  resourceClass: FetchableAPIResourceClass<Scheme>,
  params: Record<string, string>,
  session: Session
): Promise<PaginationResult<InstanceType<FetchableAPIResourceClass<Scheme>>>> => {
  const urlParams = new URLSearchParams(params)
  const url = `${API_URL}/${resourceClass.__name__}?${urlParams.toString()}`

  const {
    results: resourceList,
    count
  } = await apiGET<NamedAPIResourceList>(url, session)

  return {
    items: await Promise.all(
      resourceList.map(async (resource: NamedAPIResource) =>
        await getAPIResource(resourceClass, resource.id, session)
      )
    ),
    count
  }
}

// createAPIResource creates a new resource in the API.
// Scheme is the data scheme according to the API.
// resourceClass is the class object of the resource.
// data is the new resource data.
// session is the session object from next-auth.
// Returns the ID of the new resource.
export const createAPIResource = async <Scheme> (
  resourceClass: ApiResourceClass,
  data: Scheme,
  session: Session
): Promise<number> => {
  const url = `${API_URL}/${resourceClass.__name__}`
  const response = await apiPOST<IdHolder, Scheme>(url, session, data)
  return response.id
}

// deleteAPIResource deletes a resource in the API.
// resourceClass is the class object of the resource.
// id is the ID of the resource.
// session is the session object from next-auth.
export const deleteAPIResource = async (
  resourceClass: ApiResourceClass,
  id: number,
  session: Session
): Promise<void> => {
  const url = `${API_URL}/${resourceClass.__name__}/${id}`
  await apiDELETE<unknown>(url, session)
  await queryClient.invalidateQueries({ queryKey: [resourceClass.__name__, id] })
}

// putAPIResource updates an existing resource in the API - for now, supports only patient_id.
// ResponseScheme is the data scheme according to the API for the response.
// RequestScheme is the data scheme according to the API for the request.
// resourceClass is the class object of the resource.
// id is the ID of the resource to be updated.
// data is the updated resource data.
// session is the session object from next-auth.
export const putAPIResourceField = async <ResponseScheme, RequestScheme> (
  resourceClass: ApiResourceClass,
  id: number,
  data: RequestScheme,
  field: string,
  session: Session
): Promise<ResponseScheme> => {
  const url = `${API_URL}/${resourceClass.__name__}/${id}/${field}`
  const response = await apiPUT<ResponseScheme, RequestScheme>(url, session, data)
  await queryClient.invalidateQueries({ queryKey: [resourceClass.__name__, id] })
  return response
}

// putAPIResource updates an existing resource in the API.
// ResponseScheme is the data scheme according to the API for the response.
// RequestScheme is the data scheme according to the API for the request.
// resourceClass is the class object of the resource.
// id is the ID of the resource to be updated.
// data is the updated resource data.
// session is the session object from next-auth.
export const putAPIResource = async <ResponseScheme, RequestScheme> (
  resourceClass: ApiResourceClass,
  id: number,
  data: RequestScheme,
  session: Session
): Promise<ResponseScheme> => {
  const url = `${API_URL}/${resourceClass.__name__}/${id}`
  const response = await apiPUT<ResponseScheme, RequestScheme>(url, session, data)
  await queryClient.invalidateQueries({ queryKey: [resourceClass.__name__, id] })
  return response
}

// cancelAPIResponse cancels the assignment of a patient to an appointment in the API.
// resourceClass is the class object of the resource representing appointments.
// id is the ID of the appointment to cancel the patient assignment (integer, $int32).
// session is the session object containing authorization information from next-auth.
// Returns a Promise resolving to the ID of the previously assigned patient.
export const clearAPIResourceField = async (
  resourceClass: ApiResourceClass,
  id: number,
  field: string,
  session: Session
): Promise<number> => {
  const url = `${API_URL}/${resourceClass.__name__}/${id}/${field}`
  const response = await apiDELETE<PatientIdHolder>(url, session)
  await queryClient.invalidateQueries({ queryKey: [resourceClass.__name__, id] })
  return response.patient_id
}

/** toE164 converts a phone number to E.164 format. */
export const toE164 = (phoneNumber: string): string => {
  const addDefaultCountryCode = !phoneNumber.startsWith('+')
  const result = phone(phoneNumber, { country: addDefaultCountryCode ? 'ISR' : undefined })
  if (result.isValid) {
    return result.phoneNumber
  }
  return phoneNumber
}

// queryClient is the global React Query client.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME
    }
  }
})
