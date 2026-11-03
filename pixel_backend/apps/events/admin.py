from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "slug", "drive_folder_id")
    search_fields = ("title", "description", "drive_folder_id")
    list_filter = ("date",)
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("-date", "title")
