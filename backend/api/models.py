from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now
from datetime import timedelta

class Profile(AbstractUser):
    full_name = models.CharField(max_length=255, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    highest_education = models.CharField(max_length=100, blank=True)
    skills = models.JSONField(default=list)
    interests = models.JSONField(default=list)
    career_goals = models.JSONField(default=list)

    class Meta:
        swappable = 'AUTH_USER_MODEL'


class WebSocketMessage(models.Model):
    sender = models.CharField(max_length=255)
    recipient = models.CharField(max_length=255, blank=True, null=True)  # Blank for broadcast
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient or 'All'}"

class CareerAssessmentQuestion(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='assessment_questions', null=True, blank=True) # Added user
    question = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return now() > self.created_at + timedelta(days=30)

class CareerAssessmentAnswer(models.Model):
    question = models.ForeignKey(CareerAssessmentQuestion, on_delete=models.CASCADE)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return now() > self.created_at + timedelta(days=30)

class CareerRoadmap(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='career_roadmaps', null=True, blank=True) # Added user
    user_responses = models.TextField()  # Stores the user's responses in raw format
    roadmap = models.TextField()  # Stores the generated roadmap
    skills = models.TextField()  # Stores the required skills
    certifications = models.TextField()  # Stores the recommended certifications
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the roadmap is generated

    def __str__(self):
        return f"Career Roadmap for {self.id}"


