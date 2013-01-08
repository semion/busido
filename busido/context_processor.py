from django.conf import settings

def google_analytics_key(contsxt):
    return {'GA_KEY': settings.GOOGLE_ANALYTICS_KEY}