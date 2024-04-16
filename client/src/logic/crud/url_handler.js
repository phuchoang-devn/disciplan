import env from '../../env';

import moment from 'moment';

export const getViewQuery = (datePointer) => {
    let viewStart = moment(datePointer).add(-env.MAX_VIEW_RADIUS, 'days');
    let viewEnd = moment(datePointer).add(env.MAX_VIEW_RADIUS, 'days');

    return `from=${viewStart.format('YYYY-MM-DD')}&to=${viewEnd.format('YYYY-MM-DD')}`;
}