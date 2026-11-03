from django.db import models
from django.utils.text import slugify


class Event(models.Model):
    """
    Maps a public gallery event to a Google Drive folder.

    Drive is only used as media storage. This record is the source of
    truth for title, copy, date, URL slug, and the Drive folder id.
    """

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    drive_folder_id = models.CharField(
        max_length=128,
        help_text="Google Drive folder ID (the hash in the folder URL).",
    )

    class Meta:
        ordering = ["-date", "title"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "event"
            slug = base
            suffix = 2
            qs = Event.objects.filter(slug=slug)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            while qs.exists():
                slug = f"{base}-{suffix}"
                suffix += 1
                qs = Event.objects.filter(slug=slug)
                if self.pk:
                    qs = qs.exclude(pk=self.pk)
            self.slug = slug
        super().save(*args, **kwargs)
