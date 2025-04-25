from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('career-assess/', views.career_assessment),
    path('skill-assess/', views.skill_submit),
    path('send-message/', views.send_message),
    path('interview-prep/', views.interview_prep),
]