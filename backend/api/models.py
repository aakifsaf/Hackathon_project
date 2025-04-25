from django.contrib.auth.models import AbstractUser
from django.db import models

class Profile(AbstractUser):
    full_name = models.CharField(max_length=255, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    highest_education = models.CharField(max_length=100, blank=True)
    skills = models.JSONField(default=list)
    interests = models.JSONField(default=list)
    career_goals = models.JSONField(default=list)

    class Meta:
        swappable = 'AUTH_USER_MODEL'

class SkillAssessment(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    domain = models.CharField(max_length=100)
    score = models.FloatField()

class CourseRecommendation(models.Model):
    domain = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    url = models.URLField()

class StudyGroup(models.Model):
    name = models.CharField(max_length=100)
    topic = models.CharField(max_length=100)
    members = models.ManyToManyField(Profile)

class GroupMessage(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE)
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class SkillSelfAssessment(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE)
    programming = models.CharField(max_length=50, choices=[('Basic', 'Basic'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')], default='Basic')
    communication = models.CharField(max_length=50, choices=[('Basic', 'Basic'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')], default='Basic')
    problem_solving = models.CharField(max_length=50, choices=[('Basic', 'Basic'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')], default='Basic')
    design_thinking = models.CharField(max_length=50, choices=[('Basic', 'Basic'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')], default='Basic')



