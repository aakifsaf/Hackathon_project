from django.urls import path
from . import views
from .views import ProfileView, RegisterView, LoginView, CareerAssessmentView,CareerGuidanceView, CareerAssessmentQuestionsView, CareerAssessmentAnswersView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import DeepSeekChatBotView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('career-assess/', CareerAssessmentView.as_view(), name='career-assessment'),
    path('assess-questions/', CareerAssessmentQuestionsView.as_view(), name='career-assessment-questions'),
    path('assess-answers/', CareerAssessmentAnswersView.as_view(), name='career-assessment-answers'),
    path('user/details/', ProfileView.as_view(), name='user-details'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('chatbot/', DeepSeekChatBotView.as_view(), name='chatbot'),
    path('career-guidance/', CareerGuidanceView.as_view(), name='career-guidance'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]