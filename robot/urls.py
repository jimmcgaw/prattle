from django.conf.urls import url


app_name = 'robot'

urlpatterns = [
    url(r'^$', 'robot.views.robot', name='robot'),
    url(r'^natural/$', 'robot.views.natural', name='natural'),
    url(r'^marinedata/$', 'robot.views.marinedata', name='marinedata'),
]
