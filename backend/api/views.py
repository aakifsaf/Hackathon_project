from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import GroupMessage
from .serializers import RegisterSerializer, ProfileSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import json
from django.conf import settings


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()  # Save the new user
            
            refresh = RefreshToken.for_user(user)  # Create a refresh token
            access_token = str(refresh.access_token)  # Create an access token

            return Response(
                {'access_token': access_token, 'refresh_token': str(refresh)},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password') 
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)  # Create a refresh token
            access_token = str(refresh.access_token)  # Create an access token

            return Response(
                {'access_token': access_token, 'refresh_token': str(refresh)},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class CareerAssessmentView(APIView):
    def post(self, request):
        skills = request.data.get('skills')
        interests = request.data.get('interests')
        career_goals = request.data.get('career_goals')

        if not skills or not interests or not career_goals:
            return Response({'error': 'Skills, interests, and career goals are required'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = (
            f"Based on the following details, suggest career assessment questions:\n"
            f"Skills: {skills}\n"
            f"Interests: {interests}\n"
            f"Career Goals: {career_goals}"
        )

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "<YOUR_SITE_URL>",
            "X-Title": "<YOUR_SITE_NAME>"
        }

        payload = {
            "model": "deepseek/deepseek-r1-zero:free",
            "messages": [{"role": "user", "content": prompt}]
        }

        try:
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            message = data['choices'][0]['message']['content']
            return Response({'questions': message}, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({'error': f"OpenRouter API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SkillSubmitView(APIView):
    def post(self, request):
        weak_domains = ['SQL', 'Data Viz']
        courses = [
            {'title': 'SQL for Beginners - Coursera', 'url': 'https://coursera.org/example'}
        ]
        return Response({'weak_domains': weak_domains, 'courses': courses}, status=status.HTTP_200_OK)

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        content = request.data.get('content')
        if not group_id or not content:
            return Response({'error': 'Group ID and content are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            msg = GroupMessage.objects.create(
                group_id=group_id,
                sender=request.user,
                content=content
            )
            return Response({'status': 'sent'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InterviewPrepView(APIView):
    def post(self, request):
        role = request.data.get('role')
        if not role:
            return Response({'error': 'Role is required'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"Give 5 mock interview questions for a {role} role."

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "<YOUR_SITE_URL>",
            "X-Title": "<YOUR_SITE_NAME>"
        }

        payload = {
            "model": "deepseek/deepseek-r1-zero:free",
            "messages": [{"role": "user", "content": prompt}]
        }

        try:
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            questions = data['choices'][0]['message']['content']
            return Response({'questions': questions}, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({'error': f"OpenRouter API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            serializer = ProfileSerializer(request.user)
            if not serializer:
                return Response({'error': 'User profile does not exist'}, status=status.HTTP_404_NOT_FOUND)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

