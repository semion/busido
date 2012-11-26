from django.conf.urls import patterns, include, url
from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()
from django.views.generic.simple import direct_to_template

urlpatterns = patterns('',
    # Examples:
    url(r'^$', direct_to_template, {'template': 'index.html'}),
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.MEDIA_ROOT,
        }),
    url(r'^api/get_bounded_stops/', 'gtfs.views.get_bounded_stops'),
    url(r'^api/get_stop_data/', 'gtfs.views.get_stop_data'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
