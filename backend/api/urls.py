from django.urls import path
from . import views
from .views import UserDetailsView, RegisterView, LoginView, CareerAssessmentView, SkillSubmitView, SendMessageView, InterviewPrepView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('career-assess/', CareerAssessmentView.as_view(), name='career-assessment'),
    path('skill-assess/', SkillSubmitView.as_view(), name='skill-assessment'),
    path('send-message/', SendMessageView.as_view(), name='send-message'),
    path('interview-prep/', InterviewPrepView.as_view(), name='interview-prep'),
    path('user/details/', UserDetailsView.as_view(), name='user-details'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]