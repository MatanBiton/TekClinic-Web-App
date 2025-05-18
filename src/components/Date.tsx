/*
 * This file contains the Date component. Use it to display dates!
 */


function padTwoDigits(num: number): string {
  return num.toString().padStart(2, '0')
}


function Date(props: { date: Date }) {
    const { date } = props
    const components = [
        padTwoDigits(date.getDate()),
        padTwoDigits(date.getMonth() + 1), // Months are 0-indexed 😞
        date.getFullYear(),
    ]
    return <span>{components.join('/')}</span>
}


export default Date
