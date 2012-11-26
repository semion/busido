__author__ = 'semion'

from django.contrib.gis.db import models

class Stop(models.Model):
    stop_id = models.TextField(primary_key=True)
    stop_name = models.TextField()
    stop_desc = models.TextField()
    stop_code = models.TextField()
    stop_lat = models.FloatField()
    stop_lon = models.FloatField()
    the_geom = models.PointField(srid=4326)

    objects = models.GeoManager()

    class Meta:
        db_table = 'gtfs_stops'
        managed = False

class Agency(models.Model):
    agency_id = models.IntegerField(primary_key=True)
    agency_name = models.TextField()
    agency_url = models.TextField()
    agency_timezone = models.TextField()
    agency_lang = models.TextField()

    class Meta:
        db_table = 'gtfs_agency'
        managed = False

class Calendar(models.Model):
    service = models.TextField(primary_key=True, db_column='service_id')
    monday = models.IntegerField()
    tuesday = models.IntegerField()
    wednesday = models.IntegerField()
    thursday = models.IntegerField()
    friday = models.IntegerField()
    saturday = models.IntegerField()
    sunday = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        db_table = 'gtfs_calendar'
        managed = False

class Route(models.Model):
    route_id = models.TextField(primary_key=True)
    agency = models.ForeignKey(Agency)
    route_short_name = models.TextField()
    route_long_name = models.TextField()
    route_desc = models.TextField()

    class Meta:
        db_table = 'gtfs_routes'
        managed = False

class Trip(models.Model):
    route = models.ForeignKey(Route, related_name='trips')
    service = models.ForeignKey(Calendar, db_column='service_id')
    trip_id = models.TextField(primary_key=True)
    trip_headsign = models.TextField()

    class Meta:
        db_table = 'gtfs_trips'
        managed = False

class StopTime(models.Model):
    trip = models.ForeignKey(Trip, related_name='stoptimes')
    arrival_time = models.TextField()
    departure_time = models.TextField()
    stop = models.ForeignKey(Stop, related_name='stoptimes')
    stop_sequence = models.IntegerField(primary_key=True) # this is fake pk
    stop_headsign = models.TextField()

    class Meta:
        db_table = 'gtfs_stop_times'
        managed = False