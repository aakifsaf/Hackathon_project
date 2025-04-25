from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_mentor = models.BooleanField(default=False)
    bio = models.TextField(blank=True)
    career_goal = models.CharField(max_length=100, blank=True)

    class Meta:
        swappable = 'AUTH_USER_MODEL'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    interests = models.JSONField(default=list)
    academic_background = models.TextField(blank=True)

class SkillAssessment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    domain = models.CharField(max_length=100)
    score = models.FloatField()

class CourseRecommendation(models.Model):
    domain = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    url = models.URLField()

class StudyGroup(models.Model):
    name = models.CharField(max_length=100)
    topic = models.CharField(max_length=100)
    members = models.ManyToManyField(User)

class GroupMessage(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)



