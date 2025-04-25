from django.contrib import admin
from .models import Profile, SkillSelfAssessment, User

# Register your models here.
admin.site.register(Profile)
admin.site.register(SkillSelfAssessment)
admin.site.register(User)
