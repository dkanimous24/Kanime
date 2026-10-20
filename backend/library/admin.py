from django.contrib import admin
from .models import AnimeSnapshot, WatchlistEntry

# Register your models here.
admin.site.register(AnimeSnapshot)
admin.site.register(WatchlistEntry)
