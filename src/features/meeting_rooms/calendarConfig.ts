import moment from 'moment';
import { Formats, momentLocalizer } from 'react-big-calendar';
import {
  dayFormatter,
  rangeFormatterOnlyTime,
  selectRangeFormatter,
  timeGutterFormatter,
  weekdayFormatter,
} from './utils/formatters';

const calendarFormatConfig: Formats = {
  weekdayFormat: weekdayFormatter,
  dayFormat: dayFormatter,
  timeGutterFormat: timeGutterFormatter,
  selectRangeFormat: selectRangeFormatter,
  eventTimeRangeFormat: rangeFormatterOnlyTime,
};

export const calendarConfig: any = {
  localizer: getLocalizer(),
  formats: calendarFormatConfig,
  dayLayoutAlgorithm: 'no-overlap',
  step: 15,
  startAccessor: 'start',
  endAccessor: 'end',
  toolbar: false,
};

function getLocalizer() {
  moment.locale('ru', {
    week: {
      dow: 1,
      doy: 4,
    },
  });
  return momentLocalizer(moment);
}
