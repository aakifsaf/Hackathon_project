from django.urls import path
from . import views
from .views import ProfileView, RegisterView, LoginView, SkillSubmitView, SendMessageView, InterviewPrepView, CareerAssessmentView,CareerGuidanceView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import DeepSeekChatBotView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('career-assess/', CareerAssessmentView.as_view(), name='career-assessment'),
    path('skill-assess/', SkillSubmitView.as_view(), name='skill-assessment'),
    path('send-message/', SendMessageView.as_view(), name='send-message'),
    path('interview-prep/', InterviewPrepView.as_view(), name='interview-prep'),
    path('user/details/', ProfileView.as_view(), name='user-details'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('chatbot/', DeepSeekChatBotView.as_view(), name='chatbot'),
    path('career-guidance/', CareerGuidanceView.as_view(), name='career-guidance'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]