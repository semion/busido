from django.conf.urls import patterns, include, url
from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'gtfs.views.home'),
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.MEDIA_ROOT,
        }),
    url(r'^api/get_bounded_stops/', 'gtfs.views.get_bounded_stops'),
    url(r'^api/get_nerarest_stops/', 'gtfs.views.get_nearest_stops'),
    url(r'^api/get_stop_data/', 'gtfs.views.get_stop_data'),
    url(r'^api/get_trip_stops/', 'gtfs.views.get_trip_stops'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

handler404 = 'django.views.defaults.page_not_found'
handler500 = 'django.views.defaults.server_error'
