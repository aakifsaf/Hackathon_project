from django.contrib import admin
from .models import Profile, WebSocketMessage

# Register your models here.
admin.site.register(Profile)

class WebSocketMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'message', 'timestamp')
    ordering = ('-timestamp',)

admin.site.register(WebSocketMessage, WebSocketMessageAdmin)