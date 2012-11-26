__author__ = 'semion'

from gtfs.models import Stop, StopTime
from django.contrib.gis.geos import LinearRing
from annoying.decorators import ajax_request
from datetime import datetime

@ajax_request
def get_bounded_stops(request):

    lat_sw, lon_sw, lat_ne, lon_ne = map(float, request.REQUEST.get('bounds').split(","))

    pbox = ((lon_sw, lat_sw), (lon_sw, lat_ne),
            (lon_ne, lat_ne), (lon_ne, lat_sw), (lon_sw, lat_sw))

    lr = LinearRing(*pbox,  srid=4326)

    stops = Stop.objects.filter(the_geom__contained=lr)

    result = [{'lat': s.stop_lat,
               'lon': s.stop_lon,
               'name': s.stop_name,
               'id': s.stop_id} for s in stops]

    return {'err': 'ok', 'result': result}


@ajax_request
def get_stop_data(request):
    stop_id = request.REQUEST.get('stop_id')

    now = datetime.now()

    filter_kwargs = {'stop_id': stop_id,
                     'trip__service__start_date__lte': (now.date()),
                     'trip__service__end_date__gte': (now.date()),
                     'arrival_time__gte': (now.strftime('%H:%M:%S')),
                     'trip__service__%s' % (now.strftime('%A').lower()): 1}

    stop_times = StopTime.objects.select_related('trip', 'stop', 'trip__route')\
                                 .filter(**filter_kwargs)\
                                 .order_by('arrival_time')[:15]

    result = [{'number': s.trip.route.route_short_name.encode('utf-8'),
               'dep': s.arrival_time} for s in stop_times]

    return {'err': 'ok', 'result': result}