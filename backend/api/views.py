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
import logging
<<<<<<< HEAD
from transformers import AutoTokenizer, pipeline
=======
>>>>>>> 6515f11077ce7d0dcbc64d0114cd96bb4b94019c

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

        # Log the incoming data for debugging
        logger.debug(f"Received skills: {skills}")
        logger.debug(f"Received interests: {interests}")
        logger.debug(f"Received career goals: {career_goals}")

        if not skills or not interests or not career_goals:
            return Response({'error': 'Skills, interests, and career goals are required'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = (
            f"Based on the following details, suggest  5 career assessment mcqs with options in bracket:\n"
            f"Skills: {skills}\n"
            f"Interests: {interests}\n"
            f"Career Goals: {career_goals}"
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
    def post(self, request):
        answers = request.data.get('answers')

        if not answers or not isinstance(answers, str):
            return Response({'error': 'Answers are required and must be a string'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use NLP model to analyze the answers and produce a personalized roadmap
            roadmap = self.generate_personalized_roadmap(answers)

            return Response({'roadmap': roadmap}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_personalized_roadmap(self, content):
        """
        Use an NLP model to analyze the content and generate a personalized roadmap.
        """
        tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
        nlp = pipeline("text-classification", model="distilbert-base-uncased")

        # Truncate content to fit within the model's token limit
        tokens = tokenizer.tokenize(content)
        truncated_content = tokenizer.convert_tokens_to_string(tokens[:512])

        analysis = nlp(truncated_content)

        roadmap = []
        for item in analysis:
            label = item['label']
            score = item['score']
            roadmap.append({"domain": label, "confidence": score})

        return roadmap


class WeakDomainAndRoadmapView(APIView):
    def post(self, request):
        logger.debug("Received request for WeakDomainAndRoadmapView")
        logger.debug(f"Request data: {request.data}")

        # Validate the 'questions' field in the request
        questions = request.data.get('questions')
        if not questions or not isinstance(questions, str):
            logger.error("Invalid or missing 'questions' field")
            return Response({'error': 'Questions are required and must be a string'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Identify weak domains dynamically based on the questions provided
            weak_domains = self.identify_weak_domains(questions)
            logger.debug(f"Weak domains identified: {weak_domains}")

            if not weak_domains:
                logger.warning("No weak domains identified")
                return Response({'message': 'No weak domains identified', 'weak_domains': [], 'roadmap': {}}, status=status.HTTP_200_OK)

            # Generate a personalized roadmap based on weak domains
            roadmap = self.generate_roadmap(weak_domains)
            logger.debug(f"Generated roadmap: {roadmap}")

            return Response({'weak_domains': weak_domains, 'roadmap': roadmap}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"An error occurred while processing the request: {str(e)}")
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def identify_weak_domains(self, questions):
        """
        Identify weak domains based on the questions or answers provided.
        Here you could use keyword matching or more sophisticated NLP techniques.
        """
        weak_domains = []

        # Example logic to identify weak domains (you can refine this using NLP techniques)
        if "SQL" in questions:
            weak_domains.append('SQL')
        if "Data Visualization" in questions:
            weak_domains.append('Data Visualization')
        if "Machine Learning" in questions:
            weak_domains.append('Machine Learning')
        if "Python" in questions:
            weak_domains.append('Python')

        return weak_domains

    def generate_roadmap(self, weak_domains):
        """
        Generate a personalized roadmap based on the identified weak domains.
        """
        roadmap = {}
        for domain in weak_domains:
            if domain == 'SQL':
                roadmap[domain] = [
                    {"title": "SQL for Beginners - Coursera", "url": "https://coursera.org/example"}
                ]
            elif domain == 'Data Visualization':
                roadmap[domain] = [
                    {"title": "Data Visualization with Tableau - Coursera", "url": "https://coursera.org/example"}
                ]
            elif domain == 'Machine Learning':
                roadmap[domain] = [
                    {"title": "Machine Learning - Coursera", "url": "https://coursera.org/example"}
                ]
            elif domain == 'Python':
                roadmap[domain] = [
                    {"title": "Python for Data Science - Coursera", "url": "https://coursera.org/example"}
                ]
        return roadmap

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

