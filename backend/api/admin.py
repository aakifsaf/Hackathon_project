from django.contrib import admin
from .models import Profile, SkillSelfAssessment, GroupMessage, WebSocketMessage

# Register your models here.
admin.site.register(Profile)
admin.site.register(SkillSelfAssessment)
admin.site.register(GroupMessage)

class WebSocketMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'message', 'timestamp')
    ordering = ('-timestamp',)

admin.site.register(WebSocketMessage, WebSocketMessageAdmin)