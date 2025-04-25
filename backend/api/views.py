from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import GroupMessage
from .serializers import RegisterSerializer, ProfileSerializer
# import openai
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.conf import settings
<<<<<<< HEAD
GEMINI_API_KEY="AIzaSyAjHDnGHz6t_drpEeZ2K_UIvl7CIDyGXus"
import requests
import logging
import json
import google.generativeai as genai
from .utils.google_auth import get_gemini_access_token, list_available_models

logger = logging.getLogger(__name__)
=======
import openai

openai.api_key = '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'

>>>>>>> 1b98fa6430b89f4706f138a626c96d4fc5900d8d

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

            # Return the access and refresh tokens
            return Response(
                {'access_token': access_token, 'refresh_token': str(refresh)},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class CareerAssessmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Extract skills, interests, and career goals from the request
        skills = request.data.get('skills')
        interests = request.data.get('interests')
        career_goals = request.data.get('career_goals')

        if not skills or not interests or not career_goals:
            return Response({'error': 'Skills, interests, and career goals are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Predefined skills, interests, and goals for generating questions
        predefined_skills = ["Programming", "Problem Solving", "Data Analysis", "Creativity", "Communication", "Graphic Design", "Leadership", "Teamwork", "Critical Thinking", "Time Management"]
        predefined_interests = ["Technology", "Artificial Intelligence", "Art", "Marketing", "Finance", "Healthcare", "Education", "Environment", "Sports", "Music"]
        predefined_goals = ["Become a Data Scientist", "Start a Business", "Work in Marketing", "Develop AI Solutions", "Create Art", "Teach Students", "Improve Healthcare", "Protect the Environment", "Become a Leader", "Master a Skill"]

<<<<<<< HEAD
        # Generate questions based on predefined conditions
        quiz_questions = []
=======
<<<<<<< HEAD
        payload = {
            "model": "deepseek-chat-model",
            "messages": [{"role": "user", "content": prompt}],
        }

        headers = {
            "Authorization": "Bearer sk-0516fa8f321f4facb36f9bdf27e4e69b",
            "Content-Type": "application/json"
        }

=======
>>>>>>> 1b98fa6430b89f4706f138a626c96d4fc5900d8d
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4.1",
                messages=[{"role": "user", "content": prompt}]
            )
            message = response['choices'][0]['message']['content']
            return Response({'questions': message}, status=status.HTTP_200_OK)
        except openai.OpenAIError as e:
            return Response({'error': f"OpenAI API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
>>>>>>> 9b106e2f447cb80042ae18fbd502bbecd724a842

        for skill in skills:
            if skill in predefined_skills:
                quiz_questions.append(f"How do you apply your skill in {skill} to real-world scenarios?")

        for interest in interests:
            if interest in predefined_interests:
                quiz_questions.append(f"How does your interest in {interest} shape your career aspirations?")

        for goal in career_goals:
            if goal in predefined_goals:
                quiz_questions.append(f"What steps are you taking to achieve your goal of {goal}?")

        # Add 10 additional predefined questions for deeper analysis
        additional_questions = [
            "What are your top three strengths in your current skillset?",
            "What motivates you the most in your career?",
            "How do you prefer to learn new skills (e.g., online courses, hands-on experience, mentorship)?",
            "What challenges have you faced in achieving your career goals, and how did you overcome them?",
            "How do you prioritize tasks when working on multiple projects?",
            "What type of work environment do you thrive in (e.g., collaborative, independent, fast-paced)?",
            "How do you measure success in your professional life?",
            "What is your preferred method of problem-solving (e.g., analytical, creative, collaborative)?",
            "How do you stay updated with trends and advancements in your field of interest?",
            "What is one skill or area you would like to improve in the next six months?"
        ]

        quiz_questions.extend(additional_questions)

        # Ensure the total number of questions is 10
        while len(quiz_questions) < 10:
            quiz_questions.append("What additional skills, interests, or goals would you like to explore?")

        return Response({"quiz_questions": quiz_questions[:10]}, status=status.HTTP_200_OK)

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
        try:
            payload = {
                "prompt": prompt,
                "model": "gemini-chat-model",
                "max_tokens": 150
            }
            headers = {
                "Authorization": f"Bearer {GEMINI_API_KEY}",
                "Content-Type": "application/json"
            }
            response = requests.post("https://api.gemini.com/v1/chat/completions", json=payload, headers=headers)
            response_data = response.json()

            # Debugging: Log the response to understand its structure
            if not response.ok:
                return Response({'error': f"Gemini API error: {response_data.get('error', 'Unknown error')}"}, status=response.status_code)

            # Extract questions from the Gemini AI response
            questions = response_data.get('data', {}).get('questions', 'No questions available')
            return Response({'questions': questions}, status=status.HTTP_200_OK)
        except requests.RequestException as e:
            return Response({'error': f"Gemini API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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

