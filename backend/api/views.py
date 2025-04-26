from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import GroupMessage
from .serializers import RegisterSerializer, ProfileSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import json
from django.conf import settings
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging
from transformers import AutoTokenizer, pipeline

logger = logging.getLogger(__name__)

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

        # Log the incoming data for debugging
        logger.debug(f"Received skills: {skills}")
        logger.debug(f"Received interests: {interests}")
        logger.debug(f"Received career goals: {career_goals}")

        prompt = (
    f"As a career counselor AI, based on the following user details, generate 5 realistic and insightful career assessment questions "
    f"that can help evaluate their self-awareness, motivation, and readiness for a suitable career path:\n\n"
    f"Skills: {skills}\n"
    f"Interests: {interests}\n"
    f"Career Goals: {career_goals}\n\n"
    f"Ask open-ended or multiple-choice questions that reflect real-world scenarios, challenges, and decisions "
    f"someone might face while planning or progressing in their career."
)

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "deepseek/deepseek-r1-zero:free",  # Ensure the model name is correct
            "messages": [{"role": "user", "content": prompt}]
        }

        try:
            logger.info("Sending request to OpenRouter API")
            logger.debug(f"Payload: {json.dumps(payload, indent=2)}")
            logger.debug(f"Headers: {headers}")

            response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
            response.raise_for_status()  # Raise exception for invalid response codes

            data = response.json()
            print(f"Response from OpenRouter API: {data}")

            if 'choices' not in data or not data['choices']:
                logger.error("Invalid response structure from OpenRouter API")
                return Response({'error': 'Invalid response from OpenRouter API'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            content = data['choices'][0]['message']['content']

            return Response({'questions': content}, status=status.HTTP_200_OK)

        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error from OpenRouter API: {str(e)}")
            logger.error(f"Response content: {response.text}")
            return Response({'error': f"HTTP error from OpenRouter API: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            return Response({'error': f"Request error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CareerGuidanceView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        answers = request.data.get('answers')
        print(f"Received answers: {answers}")

        if not answers or not isinstance(answers, dict):
            return Response({'error': 'Answers are required and must be a dictionary'}, status=status.HTTP_400_BAD_REQUEST)

        # Log the incoming data for debugging
        logger.debug(f"Received answers: {answers}")

        try:
            # Use NLP model to analyze the answers and produce a personalized roadmap
            roadmap = self.generate_personalized_roadmap(answers)

            return Response({'roadmap': roadmap}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_personalized_roadmap(self, content):
    # Load a text-generation pipeline
        generator = pipeline("text-generation", model="gpt2")  # using GPT-2 for free, small generation

        # Prepare a custom prompt
        prompt = (
            "The user provided these career answers:\n"
            f"{content}\n"
            "Based on this, create a personalized 5-step career roadmap for the user to become successful in their chosen career path. "
            "Focus on suggesting skills to learn, certifications, project ideas, and career advice."
        )

        # Generate roadmap text
        output = generator(prompt, max_length=300, num_return_sequences=1)

        roadmap_text = output[0]['generated_text']

        # Just return the generated text as roadmap
        return roadmap_text


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

class DeepSeekChatBotView(APIView):
    def post(self, request):
        user_input = request.data.get('question')
        if not user_input:
            return Response({'error': 'Question is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Your OpenRouter API key directly inside views (HARDCODED)
        api_key = "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"

        # Prepare the payload for DeepSeek model
        payload = {
            "model": "deepseek/deepseek-r1-zero:free",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ],
            "stream": False
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        try:
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            reply = result["choices"][0]["message"]["content"]
            return Response({'answer': reply}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



