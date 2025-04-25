from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import GroupMessage
from .serializers import RegisterSerializer, ProfileSerializer
import openai
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.conf import settings

class RegisterView(APIView):
    def post(self, request):
        # Deserialize the data into the RegisterSerializer
        serializer = RegisterSerializer(data=request.data)
        
        # Validate and save the user if valid
        if serializer.is_valid():
            user = serializer.save()  # Save the new user
            
            # Generate JWT token after user creation
            refresh = RefreshToken.for_user(user)  # Create a refresh token
            access_token = str(refresh.access_token)  # Create an access token

            # Send the access token as a response
            return Response(
                {'access_token': access_token, 'refresh_token': str(refresh)},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')  # Get the username from the request
        password = request.data.get('password')  # Get the password from the request
        
        # Check if username and password are provided
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate the user
        user = authenticate(username=username, password=password)
        
        if user:
            # Generate JWT token after authentication
            refresh = RefreshToken.for_user(user)  # Create a refresh token
            access_token = str(refresh.access_token)  # Create an access token

            # Return the access and refresh tokens
            return Response(
                {'access_token': access_token, 'refresh_token': str(refresh)},
                status=status.HTTP_200_OK
            )
        
        # Return error if credentials are invalid
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

        # Modify this as per DeepSeek's API structure
        prompt = (
            f"Based on the following details, suggest career assessment questions:\n"
            f"Skills: {skills}\n"
            f"Interests: {interests}\n"
            f"Career Goals: {career_goals}"
        )

        payload = {
            "model": "deepseek-chat-model",
            "messages": [{"role": "user", "content": prompt}],
        }

        headers = {
            "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post("https://api.deepseek.com/v1/chat/completions", json=payload, headers=headers)
            data = response.json()
            message = data['choices'][0]['message']['content']
            return Response({'questions': message}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SkillSubmitView(APIView):
    def post(self, request):
        # Placeholder scoring logic
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
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            questions = response['choices'][0]['message']['content']
            return Response({'questions': questions}, status=status.HTTP_200_OK)
        except openai.OpenAIError as e:
            return Response({'error': f"OpenAI API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            serializer = ProfileSerializer(request.user.profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except AttributeError:
            return Response({'error': 'User profile does not exist'}, status=status.HTTP_404_NOT_FOUND)
