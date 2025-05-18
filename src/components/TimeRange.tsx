import Time, { type TimeProps } from './Time'


export default function TimeRange(
    { start, end }: {
        start: TimeProps,
        end: TimeProps,
    }
) {
    return (
        <span>
            <Time {...start}/>
            {/* Note: this '-' is not a regular dash, but a special-pretty-
                looking dash. It's unicode, that's why is must be in
                quotes. */}
            {' – '}
            <Time {...end}/>
        </span>
    )
}
