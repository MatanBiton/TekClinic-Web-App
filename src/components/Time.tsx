/*
 * This file contains the Time component. Use it to display Time!
 */


function padTwoDigits(num: number): string {
  return num.toString().padStart(2, '0')
}


interface TimePropsMinutesHours {
    minutes: number,
    hours: number,
}
interface TimePropsDate {
    date: Date,
}
export type TimeProps = TimePropsMinutesHours | TimePropsDate


/**
 * This component displays the time in the format HH:MM.
 * It can either take a date prop or minutes and hours props.
 */
function Time(props: TimeProps) {
    const date = 'date' in props ? props.date : null
    const { minutes, hours } =
        date !== null
        ? { minutes: date.getMinutes(), hours: date.getHours() }
        : props as TimePropsMinutesHours
    return <span>{padTwoDigits(hours)}:{padTwoDigits(minutes)}</span>
}


export default Time
