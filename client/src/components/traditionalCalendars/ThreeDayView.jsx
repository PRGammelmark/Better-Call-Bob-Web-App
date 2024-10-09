import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import * as dates from 'date-arithmetic'
import { Navigate } from 'react-big-calendar'
import TimeGrid from 'react-big-calendar/lib/TimeGrid'
import dayjs from 'dayjs'

function ThreeDayView({ date, localizer, max = localizer.endOf(new Date(), 'day'), min = localizer.startOf(new Date(), 'day'), scrollToTime = localizer.startOf(new Date(), 'day'), ...props }) {
  const range = useMemo(() => ThreeDayView.range(date, { localizer }), [date, localizer])

  return (
    <TimeGrid
      date={date}
      eventOffset={15}
      localizer={localizer}
      max={max}
      min={min}
      range={range}
      scrollToTime={scrollToTime}
      {...props}
    />
  )
}

ThreeDayView.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  localizer: PropTypes.object,
  max: PropTypes.instanceOf(Date),
  min: PropTypes.instanceOf(Date),
  scrollToTime: PropTypes.instanceOf(Date),
}

ThreeDayView.range = (date, { localizer }) => {
  const start = date
  const end = dates.add(start, 2, 'day')

  let current = start
  const range = []

  while (localizer.lte(current, end, 'day')) {
    range.push(current)
    current = localizer.add(current, 1, 'day')
  }

  return range
}

ThreeDayView.navigate = (date, action, { localizer }) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return localizer.add(date, -3, 'day')
    case Navigate.NEXT:
      return localizer.add(date, 3, 'day')
    default:
      return date
  }
}

ThreeDayView.title = (date) => {
  const start = date
  const end = dates.add(start, 2, 'day')

  const formattedStart = dayjs(start).format('D.')
  const formattedEnd = dayjs(end).format('D. MMM')

  return `${formattedStart}-${formattedEnd}`
}

export default ThreeDayView;
