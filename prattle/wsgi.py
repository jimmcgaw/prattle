"""
WSGI config for prattle project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/howto/deployment/wsgi/
"""

import os, sys

import os, site, sys

# From http://jmoiron.net/blog/deploying-django-mod-wsgi-virtualenv/
sys.path.append('/home/jim/source')
sys.path.append('/home/jim/source/prattle/prattle')

vepath = '/home/jim/source/prattle/lib/python2.7/site-packages/'

prev_sys_path = list(sys.path)

site.addsitedir(vepath)

# reorder sys.path so new directories from the addsitedir show up first
new_sys_path = [p for p in sys.path if p not in prev_sys_path]
for item in new_sys_path:
    sys.path.remove(item)
sys.path[:0] = new_sys_path


from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "prattle.settings")

application = get_wsgi_application()
